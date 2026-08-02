import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { Player } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface PlayerRowProps {
  gameId: string;
  player: Player;
  chipValue: number;
}

export function PlayerRow({ gameId, player, chipValue }: PlayerRowProps) {
  const buyIns = useGameStore(
    (s) =>
      s.games
        .find((g) => g.id === gameId)
        ?.buyIns.filter((b) => b.playerId === player.id) ?? [],
  );
  const addBuyIn = useGameStore((s) => s.addBuyIn);
  const removeBuyIn = useGameStore((s) => s.removeBuyIn);

  const [amount, setAmount] = useState(() => (chipValue * 100).toFixed(2));

  const total = buyIns.reduce((sum, b) => sum + b.amount, 0);
  const numericAmount = Number(amount) || 0;

  function handleAdd() {
    if (numericAmount <= 0) return;
    addBuyIn(gameId, player.id, numericAmount);
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
            {buyIns.length} buy-in{buyIns.length === 1 ? '' : 's'} · $
            {total.toFixed(2)}
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
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            aria-label={`Buy-in amount for ${player.name}`}
            className="w-20 text-center"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={handleAdd}
            disabled={numericAmount <= 0}
            aria-label="Add buy-in"
          >
            <Plus />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
