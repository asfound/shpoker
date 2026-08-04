import { useMemo, useState } from 'react';
import { ChevronDownIcon, TrashIcon } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toNonNegativeInt } from '@/lib/number';
import { findGame, useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';

interface PlayerRowProps {
  gameId: string;
  player: Player;
  defaultBuyIn: number;
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PlayerRow({
  gameId,
  player,
  defaultBuyIn,
}: Readonly<PlayerRowProps>) {
  const gameBuyIns = useGameStore((s) => findGame(s.games, gameId)?.buyIns);
  const buyIns = useMemo(
    () => gameBuyIns?.filter((b) => b.playerId === player.id) ?? [],
    [gameBuyIns, player.id],
  );
  const addBuyIn = useGameStore((s) => s.addBuyIn);
  const removeBuyIn = useGameStore((s) => s.removeBuyIn);

  const [amount, setAmount] = useState(() => String(defaultBuyIn));
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const numericAmount = toNonNegativeInt(amount);
  const total = buyIns.reduce((sum, b) => sum + b.amount, 0);
  const lastBuyIn = buyIns[buyIns.length - 1];
  const recentFirst = useMemo(() => [...buyIns].reverse(), [buyIns]);

  function handleAdd() {
    if (numericAmount <= 0) return;
    addBuyIn(gameId, player.id, numericAmount);
  }

  function handleRemoveLast() {
    if (lastBuyIn) removeBuyIn(gameId, lastBuyIn.id);
    setIsConfirmOpen(false);
  }

  return (
    <div className="card elev-sm gap-(--space-2) p-(--space-3)">
      <div className="flex items-center justify-between gap-(--space-3)">
        <div className="min-w-0">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
            {player.name}
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {buyIns.length} buy-in{buyIns.length === 1 ? '' : 's'} · €
            {Math.round(total)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <input
            className="input text-center"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            aria-label={`Buy-in amount for ${player.name}`}
            style={{ width: 76, padding: '6px 4px' }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={numericAmount <= 0}
          >
            Add
          </button>
        </div>
      </div>

      {lastBuyIn && (
        <div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-(--color-text) opacity-60 hover:opacity-100"
            style={{ fontSize: 12, padding: '4px 0' }}
            aria-expanded={isLogOpen}
            onClick={() => setIsLogOpen((v) => !v)}
          >
            {isLogOpen
              ? 'Buy-in log'
              : `Last: +€${Math.round(lastBuyIn.amount)} · ${formatTime(lastBuyIn.createdAt)}`}
            <span
              className="inline-flex transition-transform"
              style={{ transform: isLogOpen ? 'rotate(180deg)' : 'none' }}
            >
              <ChevronDownIcon size={10} />
            </span>
          </button>
          {isLogOpen && (
            <div className="flex flex-col gap-1 pt-0.5">
              {recentFirst.map((buyIn) => (
                <div
                  key={buyIn.id}
                  className="flex items-center justify-between opacity-60"
                  style={{ fontSize: 12 }}
                >
                  <span>+€{Math.round(buyIn.amount)}</span>
                  <span>{formatTime(buyIn.createdAt)}</span>
                </div>
              ))}
              <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger
                  render={
                    <button
                      type="button"
                      className="btn btn-secondary mt-1 self-start"
                      style={{ fontSize: 12, padding: '5px 10px' }}
                    >
                      <TrashIcon size={12} />
                      Remove last buy-in
                    </button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove last buy-in?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes {player.name}'s most recent buy-in of €
                      {Math.round(lastBuyIn.amount)} from{' '}
                      {formatTime(lastBuyIn.createdAt)}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveLast}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
