import type { Game, Transfer } from '@/types';

/** Net result per player in currency: final chip value minus total buy-ins. */
export function computeNet(game: Game): Record<string, number> {
  const net: Record<string, number> = {};
  for (const player of game.players) {
    const buyIns = game.buyIns
      .filter((b) => b.playerId === player.id)
      .reduce((sum, b) => sum + b.amount, 0);
    const chips = game.finalChips[player.id] ?? 0;
    net[player.id] = chips * game.chipValue - buyIns;
  }
  return net;
}

/** Greedy min-transfer settlement: match biggest debtor with biggest creditor. */
export function computeTransfers(net: Record<string, number>): Transfer[] {
  const EPSILON = 0.005;
  const balances = Object.entries(net)
    .map(([playerId, amount]) => ({ playerId, amount }))
    .filter((b) => Math.abs(b.amount) > EPSILON);

  const debtors = balances
    .filter((b) => b.amount < 0)
    .sort((a, b) => a.amount - b.amount);
  const creditors = balances
    .filter((b) => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.amount, creditor.amount);

    transfers.push({
      fromPlayerId: debtor.playerId,
      toPlayerId: creditor.playerId,
      amount: Math.round(amount * 100) / 100,
    });

    debtor.amount += amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < EPSILON) i++;
    if (Math.abs(creditor.amount) < EPSILON) j++;
  }

  return transfers;
}
