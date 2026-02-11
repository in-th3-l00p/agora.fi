import { describe, it, expect, vi, beforeEach } from "vitest";
import { BackendClient, BackendClientError } from "@agora.fi/backend";

const BASE_URL = "http://localhost:4000";

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe("BackendClient", () => {
  let client: BackendClient;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    vi.restoreAllMocks();
  });

  it("sends GET requests to the correct URL", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await client.get("/spaces");

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/spaces`, {
      method: "GET",
      headers: {},
      body: undefined,
    });
  });

  it("sends POST requests with JSON body", async () => {
    const fetch = mockFetch(201, { id: "abc" });
    vi.stubGlobal("fetch", fetch);

    await client.post("/spaces", { spaceId: "test", name: "Test" });

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/spaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spaceId: "test", name: "Test" }),
    });
  });

  it("sends PATCH requests with JSON body", async () => {
    const fetch = mockFetch(200, { id: "abc" });
    vi.stubGlobal("fetch", fetch);

    await client.patch("/listings/abc", { price: "0.1" });

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/listings/abc`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: "0.1" }),
    });
  });

  it("includes Authorization header when token is set", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    client.setToken("jwt-token-123");
    await client.get("/spaces");

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/spaces`, {
      method: "GET",
      headers: { Authorization: "Bearer jwt-token-123" },
      body: undefined,
    });
  });

  it("does not include Authorization when no token is set", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await client.get("/spaces");

    const headers = fetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("clears the token when setToken(null) is called", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    client.setToken("jwt");
    client.setToken(null);
    await client.get("/spaces");

    const headers = fetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("returns undefined for 204 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error("should not parse")),
      }),
    );

    const result = await client.delete("/spaces/test");
    expect(result).toBeUndefined();
  });

  it("throws BackendClientError for non-OK responses", async () => {
    vi.stubGlobal("fetch", mockFetch(404, { error: "Space not found" }));

    await expect(client.get("/spaces/missing")).rejects.toThrow(
      BackendClientError,
    );

    try {
      await client.get("/spaces/missing");
    } catch (err) {
      expect(err).toBeInstanceOf(BackendClientError);
      const e = err as BackendClientError;
      expect(e.status).toBe(404);
      expect(e.body.error).toBe("Space not found");
      expect(e.message).toBe("Space not found");
    }
  });

  it("throws BackendClientError for 409 conflicts", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch(409, { error: "A space with this ID already exists" }),
    );

    try {
      await client.post("/spaces", { spaceId: "dup" });
    } catch (err) {
      const e = err as BackendClientError;
      expect(e.status).toBe(409);
      expect(e.body.error).toBe("A space with this ID already exists");
    }
  });
});
