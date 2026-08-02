import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.games.find((g) => g.id === gameId));
  const addPlayer = useGameStore((s) => s.addPlayer);
  const addBuyIn = useGameStore((s) => s.addBuyIn);

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
  const defaultBuyIn = game.chipValue * 100;

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
          <div className="text-xl font-semibold">${totalPot.toFixed(2)}</div>
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
        {game.players.map((player) => {
          const buyIns = game.buyIns.filter((b) => b.playerId === player.id);
          const total = buyIns.reduce((sum, b) => sum + b.amount, 0);
          return (
            <Card key={player.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {buyIns.length} buy-in{buyIns.length === 1 ? '' : 's'} · $
                    {total.toFixed(2)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addBuyIn(game.id, player.id, defaultBuyIn)}
                >
                  +${defaultBuyIn.toFixed(2)} buy-in
                </Button>
              </CardContent>
            </Card>
          );
        })}
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
