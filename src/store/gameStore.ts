import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinalEntry, Game } from '@/types';

function makeId(): string {
  return crypto.randomUUID();
}

const MAX_GAMES = 10;

export function findGame(
  games: Game[],
  gameId: string | undefined,
): Game | undefined {
  return games.find((g) => g.id === gameId);
}

interface GameStore {
  games: Game[];

  createGame: (name: string, chipValue: number, defaultBuyIn: number) => string;
  deleteGame: (gameId: string) => void;

  addPlayer: (gameId: string, name: string) => void;

  addBuyIn: (gameId: string, playerId: string, amount: number) => void;
  removeBuyIn: (gameId: string, buyInId: string) => void;

  setFinalEntry: (gameId: string, playerId: string, entry: FinalEntry) => void;
  settleGame: (gameId: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      games: [],

      createGame: (name, chipValue, defaultBuyIn) => {
        const id = makeId();
        const game: Game = {
          id,
          name,
          chipValue,
          defaultBuyIn,
          status: 'active',
          players: [],
          buyIns: [],
          finalEntries: {},
          createdAt: Date.now(),
        };
        set((state) => ({
          games: [...state.games, game]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_GAMES),
        }));
        return id;
      },

      deleteGame: (gameId) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
        })),

      addPlayer: (gameId, name) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? { ...g, players: [...g.players, { id: makeId(), name }] }
              : g,
          ),
        })),

      addBuyIn: (gameId, playerId, amount) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  buyIns: [
                    ...g.buyIns,
                    { id: makeId(), playerId, amount, createdAt: Date.now() },
                  ],
                }
              : g,
          ),
        })),

      removeBuyIn: (gameId, buyInId) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? { ...g, buyIns: g.buyIns.filter((b) => b.id !== buyInId) }
              : g,
          ),
        })),

      setFinalEntry: (gameId, playerId, entry) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  finalEntries: { ...g.finalEntries, [playerId]: entry },
                }
              : g,
          ),
        })),

      settleGame: (gameId) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, status: 'settled' } : g,
          ),
        })),
    }),
    {
      name: 'shpoker-storage',
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as { games: Game[] };
        if (version < 1) {
          state.games = state.games.map((g) => ({
            ...g,
            defaultBuyIn: g.defaultBuyIn ?? Math.round(g.chipValue * 100),
          }));
        }
        return state;
      },
    },
  ),
);
