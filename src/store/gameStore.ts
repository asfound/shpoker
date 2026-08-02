import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Game } from '@/types';

function makeId(): string {
  return crypto.randomUUID();
}

interface GameStore {
  games: Game[];
  activeGameId: string | null;

  createGame: (name: string, chipValue: number) => string;
  deleteGame: (gameId: string) => void;
  setActiveGame: (gameId: string | null) => void;

  setDefaultBuyIn: (gameId: string, amount: number) => void;

  addPlayer: (gameId: string, name: string) => void;
  removePlayer: (gameId: string, playerId: string) => void;

  addBuyIn: (gameId: string, playerId: string, amount: number) => void;
  removeBuyIn: (gameId: string, buyInId: string) => void;

  setFinalChips: (gameId: string, playerId: string, chips: number) => void;
  settleGame: (gameId: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      games: [],
      activeGameId: null,

      createGame: (name, chipValue) => {
        const id = makeId();
        const game: Game = {
          id,
          name,
          chipValue,
          defaultBuyIn: Math.round(chipValue * 100),
          status: 'active',
          players: [],
          buyIns: [],
          finalChips: {},
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

      setDefaultBuyIn: (gameId, amount) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, defaultBuyIn: amount } : g,
          ),
        })),

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

      setFinalChips: (gameId, playerId, chips) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? { ...g, finalChips: { ...g.finalChips, [playerId]: chips } }
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
