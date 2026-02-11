import type { BackendClient } from "../client";
import type { Space, CreateSpaceInput, UpdateSpaceInput } from "../types";

export class SpacesService {
  constructor(private client: BackendClient) {}

  async list(): Promise<Space[]> {
    return this.client.get<Space[]>("/spaces");
  }

  async get(spaceId: string): Promise<Space> {
    return this.client.get<Space>(`/spaces/${encodeURIComponent(spaceId)}`);
  }

  async create(input: CreateSpaceInput): Promise<Space> {
    return this.client.post<Space>("/spaces", input);
  }

  async update(spaceId: string, input: UpdateSpaceInput): Promise<Space> {
    return this.client.put<Space>(
      `/spaces/${encodeURIComponent(spaceId)}`,
      input,
    );
  }

  async delete(spaceId: string): Promise<void> {
    return this.client.delete(`/spaces/${encodeURIComponent(spaceId)}`);
  }
}
