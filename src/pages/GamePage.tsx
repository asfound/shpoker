import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { findGame, useGameStore } from '@/store/gameStore';
import { PlayerRow } from '@/components/PlayerRow';
import { BackIcon } from '@/components/icons';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => findGame(s.games, gameId));
  const addPlayer = useGameStore((s) => s.addPlayer);

  const [newPlayerName, setNewPlayerName] = useState('');

  if (!game) {
    return (
      <div className="flex flex-col gap-4">
        <p>Game not found.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  const totalPot = game.buyIns.reduce((sum, b) => sum + b.amount, 0);
  const activeGameId = game.id;

  function handleAddPlayer() {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    addPlayer(activeGameId, trimmed);
    setNewPlayerName('');
  }

  return (
    <>
      <div className="flex items-start justify-between gap-(--space-3)">
        <div>
          <Link to="/" className="back-link">
            <BackIcon />
            Back
          </Link>
          <h1 className="mt-1" style={{ fontSize: 21 }}>
            {game.name}
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <div
            className="text-muted"
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Pot
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              fontFamily: 'var(--font-heading)',
            }}
          >
            €{Math.round(totalPot)}
          </div>
        </div>
      </div>

      <div className="flex gap-(--space-2)">
        <input
          className="input"
          placeholder="Player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
        />
        <button
          type="button"
          className="btn btn-secondary shrink-0"
          onClick={handleAddPlayer}
          disabled={!newPlayerName.trim()}
        >
          Add
        </button>
      </div>

      <div className="flex flex-col gap-(--space-3)">
        {game.players.map((player) => (
          <PlayerRow
            key={player.id}
            gameId={game.id}
            player={player}
            defaultBuyIn={game.defaultBuyIn}
          />
        ))}
        {game.players.length === 0 && (
          <p className="text-muted" style={{ fontSize: 13 }}>
            Add players to get started.
          </p>
        )}
      </div>

      {game.players.length > 0 && (
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={() => navigate(`/game/${game.id}/settle`)}
        >
          End game &amp; settle up
        </button>
      )}
    </>
  );
}
