import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BackendClient,
  SpacesService,
  AuthService,
  TilesService,
} from "@agora.fi/backend";
import type { Space, Tile } from "@agora.fi/backend";

const BASE_URL = "http://localhost:4000";

const MOCK_SPACE: Space = {
  id: "uuid-1",
  space_id: "my-space",
  name: "My Space",
  description: "A test space",
  owner_wallet: "0xabc",
  max_tiles: 100,
  token_name: "Space Token",
  token_symbol: "SPC",
  settings: {},
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
  tile_count: 3,
};

const MOCK_TILE: Tile = {
  id: "tile-uuid-1",
  space_id: "uuid-1",
  token_id: 0,
  grid_position: 0,
  owner_wallet: "0xabc",
  tier: 1,
  metadata: {},
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
};

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("AuthService", () => {
  let client: BackendClient;
  let auth: AuthService;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    auth = new AuthService(client);
    vi.restoreAllMocks();
  });

  it("getNonce sends correct GET request", async () => {
    const fetch = mockFetch(200, { nonce: "nonce-uuid" });
    vi.stubGlobal("fetch", fetch);

    const nonce = await auth.getNonce("0xABC");

    expect(nonce).toBe("nonce-uuid");
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/auth/nonce?address=0xABC`,
    );
  });

  it("verify sends POST and stores JWT on client", async () => {
    const fetch = mockFetch(200, { token: "jwt-123" });
    vi.stubGlobal("fetch", fetch);

    const token = await auth.verify("0xABC", "0xsig");

    expect(token).toBe("jwt-123");
    expect(client.getToken()).toBe("jwt-123");
    expect(fetch.mock.calls[0][0]).toBe(`${BASE_URL}/auth/verify`);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      address: "0xABC",
      signature: "0xsig",
    });
  });

  it("logout clears the token", () => {
    client.setToken("jwt-123");
    auth.logout();
    expect(client.getToken()).toBeNull();
  });
});

describe("SpacesService", () => {
  let client: BackendClient;
  let spaces: SpacesService;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    client.setToken("jwt-token");
    spaces = new SpacesService(client);
    vi.restoreAllMocks();
  });

  it("list returns array of spaces", async () => {
    vi.stubGlobal("fetch", mockFetch(200, [MOCK_SPACE]));

    const result = await spaces.list();

    expect(result).toHaveLength(1);
    expect(result[0].space_id).toBe("my-space");
    expect(result[0].tile_count).toBe(3);
  });

  it("get returns single space", async () => {
    vi.stubGlobal("fetch", mockFetch(200, MOCK_SPACE));

    const result = await spaces.get("my-space");

    expect(result.name).toBe("My Space");
  });

  it("get sends correct URL with encoded spaceId", async () => {
    const fetch = mockFetch(200, MOCK_SPACE);
    vi.stubGlobal("fetch", fetch);

    await spaces.get("my-space");

    expect(fetch.mock.calls[0][0]).toBe(`${BASE_URL}/spaces/my-space`);
  });

  it("create sends POST with correct body", async () => {
    const fetch = mockFetch(201, MOCK_SPACE);
    vi.stubGlobal("fetch", fetch);

    const result = await spaces.create({
      spaceId: "my-space",
      name: "My Space",
      description: "A test space",
      tokenName: "Space Token",
      tokenSymbol: "SPC",
    });

    expect(result.space_id).toBe("my-space");
    const sentBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentBody.spaceId).toBe("my-space");
    expect(sentBody.name).toBe("My Space");
    expect(sentBody.tokenName).toBe("Space Token");
  });

  it("update sends PUT with partial fields", async () => {
    const updated = { ...MOCK_SPACE, name: "Updated" };
    const fetch = mockFetch(200, updated);
    vi.stubGlobal("fetch", fetch);

    const result = await spaces.update("my-space", { name: "Updated" });

    expect(result.name).toBe("Updated");
    expect(fetch.mock.calls[0][1].method).toBe("PUT");
  });

  it("delete sends DELETE and returns void", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject() }),
    );

    const result = await spaces.delete("my-space");
    expect(result).toBeUndefined();
  });
});

describe("TilesService", () => {
  let client: BackendClient;
  let tiles: TilesService;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    client.setToken("jwt-token");
    tiles = new TilesService("my-space", client);
    vi.restoreAllMocks();
  });

  it("list returns array of tiles", async () => {
    vi.stubGlobal("fetch", mockFetch(200, [MOCK_TILE]));

    const result = await tiles.list();
    expect(result).toHaveLength(1);
    expect(result[0].token_id).toBe(0);
  });

  it("list sends to correct URL with spaceId", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await tiles.list();
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/spaces/my-space/tiles`,
    );
  });

  it("get sends to correct URL with tokenId", async () => {
    const fetch = mockFetch(200, MOCK_TILE);
    vi.stubGlobal("fetch", fetch);

    await tiles.get(42);
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/spaces/my-space/tiles/42`,
    );
  });

  it("create sends POST with tile data", async () => {
    const fetch = mockFetch(201, MOCK_TILE);
    vi.stubGlobal("fetch", fetch);

    await tiles.create({
      tokenId: 0,
      gridPosition: 0,
      tier: 1,
    });

    const sentBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentBody.tokenId).toBe(0);
    expect(sentBody.gridPosition).toBe(0);
    expect(sentBody.tier).toBe(1);
  });

  it("update sends PUT with partial data", async () => {
    const fetch = mockFetch(200, { ...MOCK_TILE, tier: 3 });
    vi.stubGlobal("fetch", fetch);

    const result = await tiles.update(0, { tier: 3 });
    expect(result.tier).toBe(3);
    expect(fetch.mock.calls[0][1].method).toBe("PUT");
  });

  it("delete sends DELETE", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.reject() }),
    );

    await tiles.delete(0);
  });
});
