import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { computeNet, computeTransfers } from '@/lib/settlement';
import { PlayerSettleRow } from '@/components/PlayerSettleRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SettleUp() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.games.find((g) => g.id === gameId));
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

  const allEntered = game.players.every(
    (p) => game.finalEntries[p.id] !== undefined,
  );

  const pot = game.buyIns.reduce((sum, b) => sum + b.amount, 0);
  const totalDiff = Object.values(net).reduce((sum, n) => sum + n, 0);
  const potMismatch = allEntered && Math.abs(totalDiff) > 0.5;

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
          <PlayerSettleRow key={player.id} gameId={game.id} player={player} />
        ))}
      </div>

      {potMismatch && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Totals don't match the pot: entered stacks add up to €
          {Math.round(pot + totalDiff)}, but the pot is €{Math.round(pot)}.
          Double-check the final amounts.
        </div>
      )}

      {allEntered && (
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

      <Button onClick={handleSettle} disabled={!allEntered}>
        Finish & save
      </Button>
    </div>
  );
}
