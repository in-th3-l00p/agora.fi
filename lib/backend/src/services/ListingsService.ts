import type { BackendClient } from "../client";
import type {
  Listing,
  CreateListingInput,
  UpdateListingInput,
  ListListingsQuery,
} from "../types";

export class ListingsService {
  constructor(private client: BackendClient) {}

  async list(query: ListListingsQuery = {}): Promise<Listing[]> {
    const params = new URLSearchParams();
    if (query.spaceId) params.set("spaceId", query.spaceId);
    if (query.status) params.set("status", query.status);
    if (query.sort) params.set("sort", query.sort);
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.offset !== undefined) params.set("offset", String(query.offset));

    const qs = params.toString();
    return this.client.get<Listing[]>(`/listings${qs ? `?${qs}` : ""}`);
  }

  async get(id: string): Promise<Listing> {
    return this.client.get<Listing>(`/listings/${id}`);
  }

  async create(input: CreateListingInput): Promise<Listing> {
    return this.client.post<Listing>("/listings", input);
  }

  async update(id: string, input: UpdateListingInput): Promise<Listing> {
    return this.client.patch<Listing>(`/listings/${id}`, input);
  }

  async cancel(id: string): Promise<Listing> {
    return this.client.delete<Listing>(`/listings/${id}`);
  }

  async purchase(id: string): Promise<Listing> {
    return this.client.post<Listing>(`/listings/${id}/purchase`, {});
  }
}
