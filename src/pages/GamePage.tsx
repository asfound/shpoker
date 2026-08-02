import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { PlayerRow } from '@/components/PlayerRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.games.find((g) => g.id === gameId));
  const addPlayer = useGameStore((s) => s.addPlayer);

  const [newPlayerName, setNewPlayerName] = useState('');

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

  const totalPot = game.buyIns.reduce((sum, b) => sum + b.amount, 0);

  function handleAddPlayer() {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    addPlayer(game!.id, trimmed);
    setNewPlayerName('');
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-sm text-muted-foreground underline">
            Back
          </Link>
          <h1 className="text-2xl font-semibold">{game.name}</h1>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Pot</div>
          <div className="text-xl font-semibold">${Math.round(totalPot)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Player name"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
        />
        <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          Add
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {game.players.map((player) => (
          <PlayerRow
            key={player.id}
            gameId={game.id}
            player={player}
            chipValue={game.chipValue}
          />
        ))}
        {game.players.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Add players to get started.
          </p>
        )}
      </div>

      {game.players.length > 0 && (
        <Button
          onClick={() => navigate(`/game/${game.id}/settle`)}
          variant="secondary"
        >
          End game & settle up
        </Button>
      )}
    </div>
  );
}
