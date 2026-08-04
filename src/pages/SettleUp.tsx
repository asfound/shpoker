import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { computeNet, computeTransfers } from '@/lib/settlement';
import { PlayerSettleRow } from '@/components/PlayerSettleRow';
import { BackIcon } from '@/components/icons';

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
        <Link to="/">Back home</Link>
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
    <>
      <div>
        <Link to={`/game/${game.id}`} className="back-link">
          <BackIcon />
          Back
        </Link>
        <h1 className="mt-1" style={{ fontSize: 21 }}>
          Settle up
        </h1>
      </div>

      <div className="flex flex-col gap-[var(--space-3)]">
        {game.players.map((player) => (
          <PlayerSettleRow key={player.id} gameId={game.id} player={player} />
        ))}
      </div>

      {potMismatch && (
        <div
          className="rounded-[var(--radius-md)] p-[var(--space-3)]"
          style={{
            border: '1px solid var(--color-divider)',
            background: 'color-mix(in srgb, var(--color-text) 6%, transparent)',
            fontSize: 13,
            opacity: 0.85,
          }}
        >
          Totals don't match the pot: entered stacks add up to €
          {Math.round(pot + totalDiff)}, but the pot is €{Math.round(pot)}.
          Double-check the final amounts.
        </div>
      )}

      {allEntered && (
        <div className="card gap-[var(--space-2)] p-[var(--space-4)]">
          <h5>Who owes who</h5>
          {transfers.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Everyone's even.
            </p>
          )}
          {transfers.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between"
              style={{ fontSize: 14 }}
            >
              <span>
                {playerName(t.fromPlayerId)} → {playerName(t.toPlayerId)}
              </span>
              <span className="font-medium">€{t.amount}</span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleSettle}
        disabled={!allEntered}
      >
        Finish &amp; save
      </button>
    </>
  );
}
