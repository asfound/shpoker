import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { computeNet, computeTransfers } from '@/lib/settlement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function SettleUp() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.games.find((g) => g.id === gameId));
  const setFinalChips = useGameStore((s) => s.setFinalChips);
  const settleGame = useGameStore((s) => s.settleGame);

  const net = useMemo(() => (game ? computeNet(game) : {}), [game]);
  const transfers = useMemo(() => computeTransfers(net), [net]);

  if (!game) {
    return (
      <div className="flex flex-col gap-4">
        <p>Game not found.</p>
        <Link to="/" className="underline">
          Back home
        </Link>
      </div>
    );
  }

  const playerName = (id: string) =>
    game.players.find((p) => p.id === id)?.name ?? '?';

  const allChipsEntered = game.players.every(
    (p) => game.finalChips[p.id] !== undefined,
  );

  function handleSettle() {
    settleGame(game!.id);
    navigate('/');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to={`/game/${game.id}`}
          className="text-sm text-muted-foreground underline"
        >
          Back
        </Link>
        <h1 className="text-2xl font-semibold">Settle up</h1>
      </div>

      <div className="flex flex-col gap-3">
        {game.players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between gap-3"
          >
            <Label htmlFor={`chips-${player.id}`} className="flex-1">
              {player.name}
            </Label>
            <Input
              id={`chips-${player.id}`}
              type="number"
              inputMode="numeric"
              min="0"
              className="w-28"
              placeholder="Chips"
              value={game.finalChips[player.id] ?? ''}
              onChange={(e) =>
                setFinalChips(game.id, player.id, Number(e.target.value) || 0)
              }
            />
          </div>
        ))}
      </div>

      {allChipsEntered && (
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <h2 className="font-medium">Who owes who</h2>
            {transfers.length === 0 && (
              <p className="text-sm text-muted-foreground">Everyone's even.</p>
            )}
            {transfers.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {playerName(t.fromPlayerId)} → {playerName(t.toPlayerId)}
                </span>
                <span className="font-medium">€{t.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSettle} disabled={!allChipsEntered}>
        Finish & save
      </Button>
    </div>
  );
}
