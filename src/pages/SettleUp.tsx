import { useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { findGame, useGameStore } from '@/store/gameStore';
import { computeNet, computeTransfers } from '@/lib/settlement';
import { PlayerSettleRow } from '@/components/PlayerSettleRow';
import { BackIcon, WarningIcon } from '@/components/icons';

export default function SettleUp() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => findGame(s.games, gameId));
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
  const activeGameId = game.id;

  function handleSettle() {
    settleGame(activeGameId);
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

      <div className="flex flex-col gap-(--space-3)">
        {game.players.map((player) => (
          <PlayerSettleRow key={player.id} gameId={game.id} player={player} />
        ))}
      </div>

      {potMismatch && (
        <div className="alert-warning">
          <span className="alert-warning-icon">
            <WarningIcon />
          </span>
          <div>
            <div className="alert-warning-title">
              Totals don't match the pot
            </div>
            <div className="alert-warning-body">
              Entered stacks add up to €{Math.round(pot + totalDiff)}, but the
              pot is €{Math.round(pot)}. Double-check the final amounts.
            </div>
          </div>
        </div>
      )}

      {allEntered && (
        <div className="card gap-(--space-2) p-(--space-4)">
          <h5>Who owes who</h5>
          {transfers.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Everyone's even.
            </p>
          )}
          {transfers.map((t) => (
            <div
              key={`${t.fromPlayerId}-${t.toPlayerId}`}
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
