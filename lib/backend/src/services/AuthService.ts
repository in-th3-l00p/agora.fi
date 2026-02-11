import type { BackendClient } from "../client";
import type { NonceResponse, VerifyResponse } from "../types";

export class AuthService {
  constructor(private client: BackendClient) {}

  async getNonce(address: string): Promise<string> {
    const res = await this.client.get<NonceResponse>(
      `/auth/nonce?address=${encodeURIComponent(address)}`,
    );
    return res.nonce;
  }

  async verify(address: string, signature: string): Promise<string> {
    const res = await this.client.post<VerifyResponse>("/auth/verify", {
      address,
      signature,
    });
    this.client.setToken(res.token);
    return res.token;
  }

  logout() {
    this.client.setToken(null);
  }
}
