import type { ChipCounts } from '@/lib/chips';

export interface Player {
  id: string;
  name: string;
}

export type FinalEntry =
  | { mode: 'amount'; amount: number }
  | { mode: 'chips'; chips: ChipCounts };

export interface BuyIn {
  id: string;
  playerId: string;
  amount: number;
  createdAt: number;
}

export type GameStatus = 'active' | 'settled';

export interface Game {
  id: string;
  name: string;
  chipValue: number;
  defaultBuyIn: number;
  status: GameStatus;
  players: Player[];
  buyIns: BuyIn[];
  finalEntries: Record<string, FinalEntry>;
  createdAt: number;
}

export interface Transfer {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
}
