import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FinalEntry, Game } from '@/types';

function makeId(): string {
  return crypto.randomUUID();
}

interface GameStore {
  games: Game[];
  activeGameId: string | null;

  createGame: (name: string, chipValue: number, defaultBuyIn: number) => string;
  deleteGame: (gameId: string) => void;
  setActiveGame: (gameId: string | null) => void;

  addPlayer: (gameId: string, name: string) => void;
  removePlayer: (gameId: string, playerId: string) => void;

  addBuyIn: (gameId: string, playerId: string, amount: number) => void;
  removeBuyIn: (gameId: string, buyInId: string) => void;

  setFinalEntry: (gameId: string, playerId: string, entry: FinalEntry) => void;
  settleGame: (gameId: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      games: [],
      activeGameId: null,

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
        set((state) => ({ games: [...state.games, game], activeGameId: id }));
        return id;
      },

      deleteGame: (gameId) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
          activeGameId:
            state.activeGameId === gameId ? null : state.activeGameId,
        })),

      setActiveGame: (gameId) => set({ activeGameId: gameId }),

      addPlayer: (gameId, name) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? { ...g, players: [...g.players, { id: makeId(), name }] }
              : g,
          ),
        })),

      removePlayer: (gameId, playerId) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? {
                  ...g,
                  players: g.players.filter((p) => p.id !== playerId),
                  buyIns: g.buyIns.filter((b) => b.playerId !== playerId),
                }
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
    { name: 'shpoker-storage' },
  ),
);
