import { computeChipsAmount } from '@/lib/chips';
import type { Game, Transfer } from '@/types';

/** Net result per player in currency: final stack value minus total buy-ins. */
export function computeNet(game: Game): Record<string, number> {
  const net: Record<string, number> = {};
  for (const player of game.players) {
    const buyIns = game.buyIns
      .filter((b) => b.playerId === player.id)
      .reduce((sum, b) => sum + b.amount, 0);
    const entry = game.finalEntries[player.id];
    const finalAmount = entry
      ? entry.mode === 'amount'
        ? entry.amount
        : computeChipsAmount(entry.chips)
      : 0;
    net[player.id] = Math.round(finalAmount - buyIns);
  }
  return net;
}

interface Balance {
  playerId: string;
  amount: number;
}

/**
 * Settlement that favors giving each player a single transfer over
 * minimizing the total transfer count. Pass 1 pairs off debtors and
 * creditors with matching amounts one-to-one (each side settled in
 * one transfer). Pass 2 greedily clears whatever couldn't be paired
 * exactly, which is where a player can end up with more than one
 * transfer.
 */
export function computeTransfers(net: Record<string, number>): Transfer[] {
  const EPSILON = 0.5;

  const debtors: Balance[] = Object.entries(net)
    .filter(([, amount]) => amount < -EPSILON)
    .map(([playerId, amount]) => ({ playerId, amount: -amount }));
  const creditors: Balance[] = Object.entries(net)
    .filter(([, amount]) => amount > EPSILON)
    .map(([playerId, amount]) => ({ playerId, amount }));

  const transfers: Transfer[] = [];

  for (const debtor of debtors) {
    const match = creditors.find(
      (c) =>
        c.amount > EPSILON && Math.abs(c.amount - debtor.amount) <= EPSILON,
    );
    if (!match) continue;

    transfers.push({
      fromPlayerId: debtor.playerId,
      toPlayerId: match.playerId,
      amount: Math.round(debtor.amount),
    });
    debtor.amount = 0;
    match.amount = 0;
  }

  const remainingDebtors = debtors
    .filter((d) => d.amount > EPSILON)
    .sort((a, b) => b.amount - a.amount);
  const remainingCreditors = creditors
    .filter((c) => c.amount > EPSILON)
    .sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < remainingDebtors.length && j < remainingCreditors.length) {
    const debtor = remainingDebtors[i];
    const creditor = remainingCreditors[j];
    if (!debtor || !creditor) break;

    const amount = Math.min(debtor.amount, creditor.amount);

    transfers.push({
      fromPlayerId: debtor.playerId,
      toPlayerId: creditor.playerId,
      amount: Math.round(amount),
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= EPSILON) i++;
    if (creditor.amount <= EPSILON) j++;
  }

  return transfers;
}
