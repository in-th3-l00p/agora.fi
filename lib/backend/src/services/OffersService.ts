import type { BackendClient } from "../client";
import type { Offer, CreateOfferInput, ListOffersQuery } from "../types";

export class OffersService {
  constructor(private client: BackendClient) {}

  async list(query: ListOffersQuery = {}): Promise<Offer[]> {
    const params = new URLSearchParams();
    if (query.listingId) params.set("listingId", query.listingId);
    if (query.status) params.set("status", query.status);
    if (query.offerer) params.set("offerer", query.offerer);

    const qs = params.toString();
    return this.client.get<Offer[]>(`/offers${qs ? `?${qs}` : ""}`);
  }

  async get(id: string): Promise<Offer> {
    return this.client.get<Offer>(`/offers/${id}`);
  }

  async create(input: CreateOfferInput): Promise<Offer> {
    return this.client.post<Offer>("/offers", input);
  }

  async cancel(id: string): Promise<Offer> {
    return this.client.delete<Offer>(`/offers/${id}`);
  }

  async accept(id: string): Promise<Offer> {
    return this.client.post<Offer>(`/offers/${id}/accept`, {});
  }

  async reject(id: string): Promise<Offer> {
    return this.client.post<Offer>(`/offers/${id}/reject`, {});
  }
}
