import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Home() {
  const navigate = useNavigate();
  const games = useGameStore((s) => s.games);
  const createGame = useGameStore((s) => s.createGame);
  const deleteGame = useGameStore((s) => s.deleteGame);

  const [name, setName] = useState('');
  const [chipValue, setChipValue] = useState('0.10');
  const [defaultBuyIn, setDefaultBuyIn] = useState('10');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDeleteGame = games.find((g) => g.id === pendingDeleteId);

  function handleConfirmDelete() {
    if (pendingDeleteId) deleteGame(pendingDeleteId);
    setPendingDeleteId(null);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const value = Number(chipValue);
    if (!Number.isFinite(value) || value <= 0) return;
    const buyIn = Math.round(Number(defaultBuyIn));
    if (!Number.isFinite(buyIn) || buyIn <= 0) return;
    const id = createGame(trimmed, value, buyIn);
    navigate(`/game/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">shpoker</h1>

      <Card>
        <CardHeader>
          <CardTitle>New game</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="game-name">Game name</Label>
            <Input
              id="game-name"
              placeholder="Friday night"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="chip-value">Chip value (€)</Label>
            <Input
              id="chip-value"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={chipValue}
              onChange={(e) => setChipValue(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="default-buy-in">Default buy-in (€)</Label>
            <Input
              id="default-buy-in"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={defaultBuyIn}
              onChange={(e) => setDefaultBuyIn(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Start game
          </Button>
        </CardContent>
      </Card>

      {games.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Games</h2>
          {games
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3"
              >
                <button
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <span className="font-medium">{game.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {game.status === 'settled'
                      ? 'Settled'
                      : `${game.players.length} players`}
                  </span>
                </button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setPendingDeleteId(game.id)}
                  aria-label={`Delete ${game.name}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
        </div>
      )}

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete game?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes "{pendingDeleteGame?.name}" and all its
              buy-in history. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
