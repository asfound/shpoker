import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

  const [isLogOpen, setIsLogOpen] = useState(false);

  const total = buyIns.reduce((sum, b) => sum + b.amount, 0);
  const lastBuyIn = buyIns[buyIns.length - 1];
  const recentFirst = useMemo(() => [...buyIns].reverse(), [buyIns]);

  function handleAdd() {
    addBuyIn(gameId, player.id, defaultBuyIn);
  }

  function handleUndo() {
    const last = buyIns[buyIns.length - 1];
    if (last) removeBuyIn(gameId, last.id);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">{player.name}</div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={handleUndo}
              disabled={buyIns.length === 0}
              aria-label="Undo last buy-in"
            >
              <Minus />
            </Button>
            <div
              className="flex h-8 w-20 items-center justify-center rounded-lg border border-input text-base font-medium md:text-sm"
              aria-label={`Total buy-in for ${player.name}`}
            >
              €{Math.round(total)}
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={handleAdd}
              disabled={defaultBuyIn <= 0}
              aria-label={`Add €${defaultBuyIn} buy-in`}
            >
              <Plus />
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
