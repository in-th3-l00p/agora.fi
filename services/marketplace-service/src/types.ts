import { Request } from 'express';

export interface AuthRequest extends Request {
  wallet?: string;
}

export interface Listing {
  id: string;
  space_id: string;
  token_id: number;
  seller_wallet: string;
  price: string;
  currency: string;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  expires_at: string | null;
  sold_at: string | null;
  buyer_wallet: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  listing_id: string;
  space_id: string;
  token_id: number;
  offerer_wallet: string;
  amount: string;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
}
