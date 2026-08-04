import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, RingIcon, TrashIcon } from '@/components/icons';
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
import { useGameStore } from '@/store/gameStore';

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

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

  const trimmedName = name.trim();
  const chipValueNumber = Number(chipValue);
  const defaultBuyInNumber = Math.round(Number(defaultBuyIn));
  const isValid =
    trimmedName.length > 0 &&
    Number.isFinite(chipValueNumber) &&
    chipValueNumber > 0 &&
    Number.isFinite(defaultBuyInNumber) &&
    defaultBuyInNumber > 0;

  function handleConfirmDelete() {
    if (pendingDeleteId) deleteGame(pendingDeleteId);
    setPendingDeleteId(null);
  }

  function handleCreate() {
    if (!isValid) return;
    const id = createGame(trimmedName, chipValueNumber, defaultBuyInNumber);
    navigate(`/game/${id}`);
  }

  return (
    <>
      <div className="flex flex-col gap-(--space-2)">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center rounded-full"
            style={{
              width: 34,
              height: 34,
              background: 'var(--color-surface)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <RingIcon />
          </span>
          <h1 style={{ fontSize: 22 }}>shpoker</h1>
        </div>
        <p className="text-muted" style={{ fontSize: 13 }}>
          Track buy-ins, settle up at the end of the night.
        </p>
      </div>

      <div className="card elev-sm gap-(--space-3) p-(--space-4)">
        <div className="card-kicker">New game</div>
        <div className="card-title">Start a session</div>
        <div className="field">
          <label htmlFor="game-name">Game name</label>
          <input
            id="game-name"
            className="input"
            placeholder="Friday night"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-(--space-3)">
          <div className="field">
            <label htmlFor="chip-value">Chip value (€)</label>
            <input
              id="chip-value"
              className="input"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={chipValue}
              onChange={(e) => setChipValue(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="default-buy-in">Default buy-in (€)</label>
            <input
              id="default-buy-in"
              className="input"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={defaultBuyIn}
              onChange={(e) => setDefaultBuyIn(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={handleCreate}
          disabled={!isValid}
        >
          Start game
          <ArrowRightIcon />
        </button>
      </div>

      {games.length > 0 && (
        <div className="flex flex-col gap-(--space-2)">
          <h6>Games</h6>
          {games
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-(--space-2) rounded-(--radius-md) p-(--space-3)"
                style={{ background: 'var(--color-surface)' }}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-(--space-2) border-0 bg-transparent p-0 text-left text-(--color-text)"
                >
                  <span className="min-w-0">
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                      {game.name}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {formatDate(game.createdAt)}
                    </span>
                  </span>
                  <span
                    className={
                      game.status === 'settled'
                        ? 'tag tag-neutral'
                        : 'tag tag-accent'
                    }
                  >
                    {game.status === 'settled'
                      ? 'settled'
                      : `${game.players.length} players`}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label={`Delete ${game.name}`}
                  onClick={() => setPendingDeleteId(game.id)}
                >
                  <TrashIcon />
                </button>
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
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
