import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findGame, useGameStore } from '@/store/gameStore';

function resetStore() {
  useGameStore.setState({ games: [] });
}

describe('gameStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('createGame adds an active game with the given settings', () => {
    const id = useGameStore.getState().createGame('Friday', 0.1, 10);
    const game = findGame(useGameStore.getState().games, id);

    expect(game?.name).toBe('Friday');
    expect(game?.chipValue).toBe(0.1);
    expect(game?.defaultBuyIn).toBe(10);
    expect(game?.status).toBe('active');
    expect(game?.players).toEqual([]);
    expect(game?.buyIns).toEqual([]);
  });

  it('keeps only the 10 most recently created games', () => {
    // createdAt comes from Date.now(); fake timers give each game a
    // distinct, deterministic timestamp instead of racing the clock.
    vi.useFakeTimers();
    for (let i = 0; i < 12; i++) {
      vi.setSystemTime(i * 1000);
      useGameStore.getState().createGame(`Game ${i}`, 0.1, 10);
    }
    vi.useRealTimers();

    const { games } = useGameStore.getState();
    expect(games).toHaveLength(10);
    expect(games.map((g) => g.name)).toEqual([
      'Game 11',
      'Game 10',
      'Game 9',
      'Game 8',
      'Game 7',
      'Game 6',
      'Game 5',
      'Game 4',
      'Game 3',
      'Game 2',
    ]);
  });

  it('deleteGame removes it', () => {
    const id = useGameStore.getState().createGame('G', 0.1, 10);
    useGameStore.getState().deleteGame(id);

    expect(findGame(useGameStore.getState().games, id)).toBeUndefined();
  });

  it('addPlayer appends a player to the game', () => {
    const id = useGameStore.getState().createGame('G', 0.1, 10);
    useGameStore.getState().addPlayer(id, 'Alice');

    const game = findGame(useGameStore.getState().games, id);
    expect(game?.players).toHaveLength(1);
    expect(game?.players[0]?.name).toBe('Alice');
  });

  it('addBuyIn records a buy-in for a player', () => {
    const id = useGameStore.getState().createGame('G', 0.1, 10);
    useGameStore.getState().addPlayer(id, 'Alice');
    const playerId = findGame(useGameStore.getState().games, id)!.players[0]!
      .id;

    useGameStore.getState().addBuyIn(id, playerId, 20);

    const game = findGame(useGameStore.getState().games, id);
    expect(game?.buyIns).toHaveLength(1);
    expect(game?.buyIns[0]?.amount).toBe(20);
    expect(game?.buyIns[0]?.playerId).toBe(playerId);
  });

  it('removeBuyIn removes a specific buy-in', () => {
    const id = useGameStore.getState().createGame('G', 0.1, 10);
    useGameStore.getState().addPlayer(id, 'Alice');
    const playerId = findGame(useGameStore.getState().games, id)!.players[0]!
      .id;
    useGameStore.getState().addBuyIn(id, playerId, 20);
    const buyInId = findGame(useGameStore.getState().games, id)!.buyIns[0]!.id;

    useGameStore.getState().removeBuyIn(id, buyInId);

    expect(findGame(useGameStore.getState().games, id)?.buyIns).toHaveLength(0);
  });

  it('setFinalEntry stores the settle entry for a player', () => {
    const id = useGameStore.getState().createGame('G', 0.1, 10);
    useGameStore.getState().addPlayer(id, 'Alice');
    const playerId = findGame(useGameStore.getState().games, id)!.players[0]!
      .id;

    useGameStore
      .getState()
      .setFinalEntry(id, playerId, { mode: 'amount', amount: 50 });

    expect(
      findGame(useGameStore.getState().games, id)?.finalEntries[playerId],
    ).toEqual({ mode: 'amount', amount: 50 });
  });

  it('settleGame marks the game as settled', () => {
    const id = useGameStore.getState().createGame('G', 0.1, 10);
    useGameStore.getState().settleGame(id);

    expect(findGame(useGameStore.getState().games, id)?.status).toBe('settled');
  });
});

describe('findGame', () => {
  it('returns undefined for an unknown or missing id', () => {
    expect(findGame([], 'nope')).toBeUndefined();
    expect(findGame([], undefined)).toBeUndefined();
  });
});
