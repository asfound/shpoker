export interface Player {
  id: string;
  name: string;
}

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
  status: GameStatus;
  players: Player[];
  buyIns: BuyIn[];
  finalChips: Record<string, number>;
  createdAt: number;
}

export interface Settlement {
  playerId: string;
  amount: number;
}

export interface Transfer {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
}
