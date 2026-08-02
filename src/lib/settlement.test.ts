import { describe, expect, it } from 'vitest';
import { computeNet, computeTransfers } from '@/lib/settlement';
import type { BuyIn, Game, Player } from '@/types';

/**
 * Builds a minimal Game from a readable table of players: how much
 * each bought in for, and how much they left the table with.
 */
function buildGame(
  entries: { id: string; buyIn: number; final: number }[],
): Game {
  const players: Player[] = entries.map((e) => ({ id: e.id, name: e.id }));
  const buyIns: BuyIn[] = entries.map((e, i) => ({
    id: `b${i}`,
    playerId: e.id,
    amount: e.buyIn,
    createdAt: 0,
  }));
  const finalEntries: Game['finalEntries'] = Object.fromEntries(
    entries.map((e) => [e.id, { mode: 'amount' as const, amount: e.final }]),
  );

  return {
    id: 'game',
    name: 'game',
    chipValue: 0.1,
    defaultBuyIn: 10,
    status: 'active',
    players,
    buyIns,
    finalEntries,
    createdAt: 0,
  };
}

/** Order-independent comparison: who pays whom, how much. */
function transferSet(
  transfers: { fromPlayerId: string; toPlayerId: string; amount: number }[],
) {
  return transfers
    .map((t) => `${t.fromPlayerId}->${t.toPlayerId}:${t.amount}`)
    .sort();
}

describe('computeNet', () => {
  it('is final amount minus buy-in, per player', () => {
    const game = buildGame([
      { id: 'A', buyIn: 20, final: 35 },
      { id: 'B', buyIn: 20, final: 5 },
    ]);

    expect(computeNet(game)).toEqual({ A: 15, B: -15 });
  });

  it('sums multiple buy-ins for the same player', () => {
    const game = buildGame([{ id: 'A', buyIn: 10, final: 10 }]);
    game.buyIns.push({
      id: 'b-extra',
      playerId: 'A',
      amount: 10,
      createdAt: 0,
    });

    // Bought in 20 total, left with 10 => down 10.
    expect(computeNet(game)).toEqual({ A: -10 });
  });

  it('treats a player with no final entry as having 0', () => {
    const game = buildGame([{ id: 'A', buyIn: 10, final: 0 }]);
    delete game.finalEntries.A;

    expect(computeNet(game)).toEqual({ A: -10 });
  });
});

describe('computeTransfers', () => {
  it('does nothing when everyone breaks even', () => {
    const net = { A: 0, B: 0 };
    expect(computeTransfers(net)).toEqual([]);
  });

  it('single debtor, single creditor: one transfer', () => {
    // A bought in 20, left with 0. B bought in 20, left with 40.
    const game = buildGame([
      { id: 'A', buyIn: 20, final: 0 },
      { id: 'B', buyIn: 20, final: 40 },
    ]);
    const net = computeNet(game);
    expect(net).toEqual({ A: -20, B: 20 });

    const transfers = computeTransfers(net);
    expect(transferSet(transfers)).toEqual(['A->B:20']);
  });

  it('exact 1:1 matches settle in a single transfer each, even when mixed with a non-matching pair', () => {
    // A owes exactly what C is owed (30); B owes exactly what D is owed (20).
    const game = buildGame([
      { id: 'A', buyIn: 30, final: 0 }, // -30
      { id: 'B', buyIn: 20, final: 0 }, // -20
      { id: 'C', buyIn: 0, final: 30 }, // +30
      { id: 'D', buyIn: 0, final: 20 }, // +20
    ]);
    const net = computeNet(game);
    expect(net).toEqual({ A: -30, B: -20, C: 30, D: 20 });

    const transfers = computeTransfers(net);
    expect(transferSet(transfers)).toEqual(['A->C:30', 'B->D:20']);
    // Every player appears in exactly one transfer.
    expect(transfers).toHaveLength(2);
  });

  it('many debtors covering one creditor: each debtor pays once', () => {
    // Two players each down 15, one player up 30.
    const game = buildGame([
      { id: 'A', buyIn: 15, final: 0 }, // -15
      { id: 'B', buyIn: 15, final: 0 }, // -15
      { id: 'C', buyIn: 30, final: 60 }, // +30
    ]);
    const net = computeNet(game);
    expect(net).toEqual({ A: -15, B: -15, C: 30 });

    const transfers = computeTransfers(net);
    expect(transferSet(transfers)).toEqual(['A->C:15', 'B->C:15']);
    // A and B each make exactly one transfer; C just receives twice.
    expect(transfers.filter((t) => t.fromPlayerId === 'A')).toHaveLength(1);
    expect(transfers.filter((t) => t.fromPlayerId === 'B')).toHaveLength(1);
  });

  it('one debtor covering many creditors: that debtor unavoidably pays twice', () => {
    // One player down 30, two players each up 15.
    const game = buildGame([
      { id: 'A', buyIn: 30, final: 0 }, // -30
      { id: 'B', buyIn: 15, final: 30 }, // +15
      { id: 'C', buyIn: 15, final: 30 }, // +15
    ]);
    const net = computeNet(game);
    expect(net).toEqual({ A: -30, B: 15, C: 15 });

    const transfers = computeTransfers(net);
    expect(transferSet(transfers)).toEqual(['A->B:15', 'A->C:15']);
    expect(transfers.filter((t) => t.fromPlayerId === 'A')).toHaveLength(2);
  });

  it('leftover amount forces exactly one player into a second transfer', () => {
    // A and B both down 25. C up 30, D up 20.
    // Neither debtor exactly matches either creditor, so one of them
    // has to split across two transfers.
    const game = buildGame([
      { id: 'A', buyIn: 25, final: 0 }, // -25
      { id: 'B', buyIn: 25, final: 0 }, // -25
      { id: 'C', buyIn: 0, final: 30 }, // +30
      { id: 'D', buyIn: 0, final: 20 }, // +20
    ]);
    const net = computeNet(game);
    expect(net).toEqual({ A: -25, B: -25, C: 30, D: 20 });

    const transfers = computeTransfers(net);
    expect(transfers).toHaveLength(3);
    // Total paid still reconciles to what's owed.
    expect(transfers.reduce((sum, t) => sum + t.amount, 0)).toBe(50);
  });

  it('ignores balances within the rounding epsilon (nobody owes a stray cent)', () => {
    const net = { A: -0.3, B: 0.3, C: -20, D: 20 };
    const transfers = computeTransfers(net);
    expect(transferSet(transfers)).toEqual(['C->D:20']);
  });

  it('three-way cycle nets down to two transfers', () => {
    // A down 10, B breaks even in/out but net captures only final vs
    // buy-in, so model it directly via buildGame for clarity.
    const game = buildGame([
      { id: 'A', buyIn: 10, final: 0 }, // -10
      { id: 'B', buyIn: 10, final: 15 }, // +5
      { id: 'C', buyIn: 10, final: 15 }, // +5
    ]);
    const net = computeNet(game);
    expect(net).toEqual({ A: -10, B: 5, C: 5 });

    const transfers = computeTransfers(net);
    expect(transferSet(transfers)).toEqual(['A->B:5', 'A->C:5']);
  });
});
