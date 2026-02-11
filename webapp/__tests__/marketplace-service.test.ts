import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BackendClient,
  ListingsService,
  OffersService,
  AuthService,
} from "@agora.fi/backend";
import type { Listing, Offer } from "@agora.fi/backend";

const BASE_URL = "http://localhost:4001";

const MOCK_LISTING: Listing = {
  id: "listing-uuid-1",
  space_id: "test-space",
  token_id: 1,
  seller_wallet: "0xseller",
  price: "0.08",
  currency: "ETH",
  status: "active",
  expires_at: null,
  sold_at: null,
  buyer_wallet: null,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
};

const MOCK_OFFER: Offer = {
  id: "offer-uuid-1",
  listing_id: "listing-uuid-1",
  space_id: "test-space",
  token_id: 1,
  offerer_wallet: "0xbuyer",
  amount: "0.05",
  currency: "ETH",
  status: "pending",
  expires_at: "2025-02-01T00:00:00.000Z",
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

describe("Marketplace AuthService", () => {
  let client: BackendClient;
  let auth: AuthService;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    auth = new AuthService(client);
    vi.restoreAllMocks();
  });

  it("authenticates against the marketplace service URL", async () => {
    const fetch = mockFetch(200, { nonce: "m-nonce" });
    vi.stubGlobal("fetch", fetch);

    const nonce = await auth.getNonce("0xABC");

    expect(nonce).toBe("m-nonce");
    expect(fetch.mock.calls[0][0]).toContain(BASE_URL);
  });

  it("verify stores JWT on the marketplace client", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { token: "m-jwt" }));

    await auth.verify("0xABC", "0xsig");
    expect(client.getToken()).toBe("m-jwt");
  });
});

describe("ListingsService", () => {
  let client: BackendClient;
  let listings: ListingsService;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    client.setToken("jwt-token");
    listings = new ListingsService(client);
    vi.restoreAllMocks();
  });

  it("list with no query returns all listings", async () => {
    vi.stubGlobal("fetch", mockFetch(200, [MOCK_LISTING]));

    const result = await listings.list();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("listing-uuid-1");
  });

  it("list sends correct URL without query params", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await listings.list();
    expect(fetch.mock.calls[0][0]).toBe(`${BASE_URL}/listings`);
  });

  it("list with query params builds correct URL", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await listings.list({
      spaceId: "test-space",
      status: "active",
      sort: "price_asc",
      limit: 10,
      offset: 20,
    });

    const url = fetch.mock.calls[0][0] as string;
    expect(url).toContain("spaceId=test-space");
    expect(url).toContain("status=active");
    expect(url).toContain("sort=price_asc");
    expect(url).toContain("limit=10");
    expect(url).toContain("offset=20");
  });

  it("list with partial query omits unset params", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await listings.list({ spaceId: "test-space" });

    const url = fetch.mock.calls[0][0] as string;
    expect(url).toContain("spaceId=test-space");
    expect(url).not.toContain("status=");
    expect(url).not.toContain("sort=");
  });

  it("get returns single listing", async () => {
    vi.stubGlobal("fetch", mockFetch(200, MOCK_LISTING));

    const result = await listings.get("listing-uuid-1");
    expect(result.price).toBe("0.08");
    expect(result.status).toBe("active");
  });

  it("create sends POST with listing data", async () => {
    const fetch = mockFetch(201, MOCK_LISTING);
    vi.stubGlobal("fetch", fetch);

    const result = await listings.create({
      spaceId: "test-space",
      tokenId: 1,
      price: "0.08",
      currency: "ETH",
    });

    expect(result.id).toBe("listing-uuid-1");
    const sentBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentBody.spaceId).toBe("test-space");
    expect(sentBody.tokenId).toBe(1);
    expect(sentBody.price).toBe("0.08");
  });

  it("update sends PATCH with partial fields", async () => {
    const updated = { ...MOCK_LISTING, price: "0.10" };
    const fetch = mockFetch(200, updated);
    vi.stubGlobal("fetch", fetch);

    const result = await listings.update("listing-uuid-1", { price: "0.10" });

    expect(result.price).toBe("0.10");
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/listings/listing-uuid-1`,
    );
  });

  it("cancel sends DELETE and returns the cancelled listing", async () => {
    const cancelled = { ...MOCK_LISTING, status: "cancelled" as const };
    vi.stubGlobal("fetch", mockFetch(200, cancelled));

    const result = await listings.cancel("listing-uuid-1");

    expect(result.status).toBe("cancelled");
  });

  it("purchase sends POST to /listings/:id/purchase", async () => {
    const sold = {
      ...MOCK_LISTING,
      status: "sold" as const,
      buyer_wallet: "0xbuyer",
    };
    const fetch = mockFetch(200, sold);
    vi.stubGlobal("fetch", fetch);

    const result = await listings.purchase("listing-uuid-1");

    expect(result.status).toBe("sold");
    expect(result.buyer_wallet).toBe("0xbuyer");
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/listings/listing-uuid-1/purchase`,
    );
    expect(fetch.mock.calls[0][1].method).toBe("POST");
  });
});

describe("OffersService", () => {
  let client: BackendClient;
  let offers: OffersService;

  beforeEach(() => {
    client = new BackendClient(BASE_URL);
    client.setToken("jwt-token");
    offers = new OffersService(client);
    vi.restoreAllMocks();
  });

  it("list with no query returns all offers", async () => {
    vi.stubGlobal("fetch", mockFetch(200, [MOCK_OFFER]));

    const result = await offers.list();
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("0.05");
  });

  it("list with query params builds correct URL", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await offers.list({ listingId: "listing-uuid-1", status: "pending" });

    const url = fetch.mock.calls[0][0] as string;
    expect(url).toContain("listingId=listing-uuid-1");
    expect(url).toContain("status=pending");
  });

  it("list with offerer query param", async () => {
    const fetch = mockFetch(200, []);
    vi.stubGlobal("fetch", fetch);

    await offers.list({ offerer: "0xbuyer" });

    const url = fetch.mock.calls[0][0] as string;
    expect(url).toContain("offerer=0xbuyer");
  });

  it("get returns single offer", async () => {
    vi.stubGlobal("fetch", mockFetch(200, MOCK_OFFER));

    const result = await offers.get("offer-uuid-1");
    expect(result.offerer_wallet).toBe("0xbuyer");
    expect(result.status).toBe("pending");
  });

  it("create sends POST with offer data", async () => {
    const fetch = mockFetch(201, MOCK_OFFER);
    vi.stubGlobal("fetch", fetch);

    const result = await offers.create({
      listingId: "listing-uuid-1",
      amount: "0.05",
      currency: "ETH",
      expiresAt: "2025-02-01T00:00:00.000Z",
    });

    expect(result.id).toBe("offer-uuid-1");
    const sentBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sentBody.listingId).toBe("listing-uuid-1");
    expect(sentBody.amount).toBe("0.05");
    expect(sentBody.expiresAt).toBe("2025-02-01T00:00:00.000Z");
  });

  it("cancel sends DELETE and returns cancelled offer", async () => {
    const cancelled = { ...MOCK_OFFER, status: "cancelled" as const };
    vi.stubGlobal("fetch", mockFetch(200, cancelled));

    const result = await offers.cancel("offer-uuid-1");
    expect(result.status).toBe("cancelled");
  });

  it("accept sends POST to /offers/:id/accept", async () => {
    const accepted = { ...MOCK_OFFER, status: "accepted" as const };
    const fetch = mockFetch(200, accepted);
    vi.stubGlobal("fetch", fetch);

    const result = await offers.accept("offer-uuid-1");

    expect(result.status).toBe("accepted");
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/offers/offer-uuid-1/accept`,
    );
    expect(fetch.mock.calls[0][1].method).toBe("POST");
  });

  it("reject sends POST to /offers/:id/reject", async () => {
    const rejected = { ...MOCK_OFFER, status: "rejected" as const };
    const fetch = mockFetch(200, rejected);
    vi.stubGlobal("fetch", fetch);

    const result = await offers.reject("offer-uuid-1");

    expect(result.status).toBe("rejected");
    expect(fetch.mock.calls[0][0]).toBe(
      `${BASE_URL}/offers/offer-uuid-1/reject`,
    );
  });
});

describe("End-to-end flow: list → create → purchase", () => {
  let sellerClient: BackendClient;
  let buyerClient: BackendClient;

  beforeEach(() => {
    sellerClient = new BackendClient(BASE_URL);
    sellerClient.setToken("seller-jwt");
    buyerClient = new BackendClient(BASE_URL);
    buyerClient.setToken("buyer-jwt");
    vi.restoreAllMocks();
  });

  it("simulates full marketplace flow with mocked responses", async () => {
    const sellerListings = new ListingsService(sellerClient);
    const buyerListings = new ListingsService(buyerClient);
    const buyerOffers = new OffersService(buyerClient);
    const sellerOffers = new OffersService(sellerClient);

    // 1. Seller creates a listing
    vi.stubGlobal("fetch", mockFetch(201, MOCK_LISTING));
    const listing = await sellerListings.create({
      spaceId: "test-space",
      tokenId: 1,
      price: "0.08",
    });
    expect(listing.status).toBe("active");

    // 2. Buyer makes an offer
    vi.stubGlobal("fetch", mockFetch(201, MOCK_OFFER));
    const offer = await buyerOffers.create({
      listingId: listing.id,
      amount: "0.05",
      expiresAt: "2025-02-01T00:00:00.000Z",
    });
    expect(offer.status).toBe("pending");

    // 3. Seller accepts the offer
    const accepted = { ...MOCK_OFFER, status: "accepted" as const };
    vi.stubGlobal("fetch", mockFetch(200, accepted));
    const result = await sellerOffers.accept(offer.id);
    expect(result.status).toBe("accepted");

    // 4. Alternatively, buyer can purchase directly
    const sold = {
      ...MOCK_LISTING,
      status: "sold" as const,
      buyer_wallet: "0xbuyer",
    };
    vi.stubGlobal("fetch", mockFetch(200, sold));
    const purchased = await buyerListings.purchase(listing.id);
    expect(purchased.status).toBe("sold");
    expect(purchased.buyer_wallet).toBe("0xbuyer");
  });
});
