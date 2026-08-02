import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

export function PlayerRow({ gameId, player, defaultBuyIn }: PlayerRowProps) {
  const gameBuyIns = useGameStore(
    (s) => s.games.find((g) => g.id === gameId)?.buyIns,
  );
  const buyIns = useMemo(
    () => gameBuyIns?.filter((b) => b.playerId === player.id) ?? [],
    [gameBuyIns, player.id],
  );
  const addBuyIn = useGameStore((s) => s.addBuyIn);
  const removeBuyIn = useGameStore((s) => s.removeBuyIn);

  const [amount, setAmount] = useState(() => String(defaultBuyIn));
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const numericAmount = Number(amount) || 0;
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
    <Card>
      <CardContent className="flex flex-col gap-1 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-muted-foreground">
              {buyIns.length} buy-in{buyIns.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              aria-label={`Buy-in amount for ${player.name}`}
              className="w-20 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={numericAmount <= 0}
            >
              Add
            </Button>
          </div>
        </div>

        {lastBuyIn && (
          <Accordion>
            <AccordionItem onOpenChange={setIsLogOpen}>
              <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
                {isLogOpen
                  ? 'Buy-in log'
                  : `Last: +€${Math.round(lastBuyIn.amount)} · ${formatTime(lastBuyIn.createdAt)}`}
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-0">
                <ul className="flex flex-col gap-1">
                  {recentFirst.map((buyIn) => (
                    <li
                      key={buyIn.id}
                      className="flex items-center justify-between text-xs text-muted-foreground"
                    >
                      <span>+€{Math.round(buyIn.amount)}</span>
                      <span>{formatTime(buyIn.createdAt)}</span>
                    </li>
                  ))}
                </ul>
                <AlertDialog
                  open={isConfirmOpen}
                  onOpenChange={setIsConfirmOpen}
                >
                  <AlertDialogTrigger
                    render={
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                      >
                        <Trash2 />
                        Remove last buy-in
                      </Button>
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
                      <AlertDialogAction
                        variant="destructive"
                        onClick={handleRemoveLast}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
