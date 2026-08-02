import { useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PlayerRowProps {
  gameId: string;
  player: Player;
  defaultBuyIn: number;
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

  const total = buyIns.reduce((sum, b) => sum + b.amount, 0);

  function handleAdd() {
    addBuyIn(gameId, player.id, defaultBuyIn);
  }

  function handleUndo() {
    const last = buyIns[buyIns.length - 1];
    if (last) removeBuyIn(gameId, last.id);
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <div>
          <div className="font-medium">{player.name}</div>
          <div className="text-sm text-muted-foreground">
            {buyIns.length} buy-in{buyIns.length === 1 ? '' : 's'}
          </div>
        </div>
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
      </CardContent>
    </Card>
  );
}
