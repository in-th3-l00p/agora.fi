import type { BackendClient } from "../client";
import type { Tile, CreateTileInput, UpdateTileInput } from "../types";

export class TilesService {
  constructor(
    private spaceId: string,
    private client: BackendClient,
  ) {}

  private basePath() {
    return `/spaces/${encodeURIComponent(this.spaceId)}/tiles`;
  }

  async list(): Promise<Tile[]> {
    return this.client.get<Tile[]>(this.basePath());
  }

  async get(tokenId: number): Promise<Tile> {
    return this.client.get<Tile>(`${this.basePath()}/${tokenId}`);
  }

  async create(input: CreateTileInput): Promise<Tile> {
    return this.client.post<Tile>(this.basePath(), input);
  }

  async update(tokenId: number, input: UpdateTileInput): Promise<Tile> {
    return this.client.put<Tile>(`${this.basePath()}/${tokenId}`, input);
  }

  async delete(tokenId: number): Promise<void> {
    return this.client.delete(`${this.basePath()}/${tokenId}`);
  }
}
