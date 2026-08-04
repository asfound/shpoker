import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { CHIP_DEFS, computeChipsAmount, emptyChipCounts } from '@/lib/chips';
import type { ChipColor } from '@/lib/chips';
import type { FinalEntry, Player } from '@/types';
import { ChipIcon } from '@/components/ChipIcon';

interface PlayerSettleRowProps {
  gameId: string;
  player: Player;
}

export function PlayerSettleRow({ gameId, player }: PlayerSettleRowProps) {
  const setFinalEntry = useGameStore((s) => s.setFinalEntry);
  const buyInsTotal = useGameStore(
    (s) =>
      s.games
        .find((g) => g.id === gameId)
        ?.buyIns.filter((b) => b.playerId === player.id)
        .reduce((sum, b) => sum + b.amount, 0) ?? 0,
  );
  const storedEntry = useGameStore.getState().games.find((g) => g.id === gameId)
    ?.finalEntries[player.id];

  const [mode, setMode] = useState<FinalEntry['mode']>(
    storedEntry?.mode ?? 'amount',
  );
  const [amount, setAmount] = useState(() =>
    storedEntry?.mode === 'amount' ? String(storedEntry.amount) : '',
  );
  const [chips, setChips] = useState(() =>
    storedEntry?.mode === 'chips' ? storedEntry.chips : emptyChipCounts(),
  );

  function handleModeChange(next: FinalEntry['mode']) {
    setMode(next);
    if (next === 'amount') {
      setFinalEntry(gameId, player.id, {
        mode: 'amount',
        amount: Number(amount) || 0,
      });
    } else {
      setFinalEntry(gameId, player.id, { mode: 'chips', chips });
    }
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    setFinalEntry(gameId, player.id, {
      mode: 'amount',
      amount: Number(value) || 0,
    });
  }

  function handleChipChange(color: ChipColor, value: string) {
    const nextChips = { ...chips, [color]: Number(value) || 0 };
    setChips(nextChips);
    setFinalEntry(gameId, player.id, { mode: 'chips', chips: nextChips });
  }

  const chipsTotal = computeChipsAmount(chips);
  const finalAmount = mode === 'amount' ? Number(amount) || 0 : chipsTotal;
  const diff = Math.round(finalAmount - buyInsTotal);
  const diffLabel =
    diff > 0 ? `+€${diff}` : diff < 0 ? `−€${Math.abs(diff)}` : '€0';
  const diffColor =
    diff > 0
      ? 'var(--color-accent-300)'
      : diff < 0
        ? 'color-mix(in srgb, var(--color-text) 65%, transparent)'
        : 'color-mix(in srgb, var(--color-text) 55%, transparent)';

  const radioName = `settle-mode-${player.id}`;

  return (
    <div className="card elev-sm gap-[var(--space-3)] p-[var(--space-3)]">
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{player.name}</span>
            <span className="text-muted" style={{ fontSize: 11 }}>
              bought in €{Math.round(buyInsTotal)}
            </span>
          </div>
          <div
            className="mt-0.5 font-medium"
            style={{ fontSize: 14, color: diffColor }}
          >
            {diffLabel}
          </div>
        </div>
        <div className="seg shrink-0">
          <label className="seg-opt">
            <input
              type="radio"
              name={radioName}
              checked={mode === 'amount'}
              onChange={() => handleModeChange('amount')}
            />
            Amount
          </label>
          <label className="seg-opt">
            <input
              type="radio"
              name={radioName}
              checked={mode === 'chips'}
              onChange={() => handleModeChange('chips')}
            />
            Chips
          </label>
        </div>
      </div>

      {mode === 'amount' ? (
        <input
          className="input"
          type="number"
          inputMode="numeric"
          step="1"
          min="0"
          placeholder="Amount (€)"
          aria-label={`Final amount for ${player.name}`}
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
        />
      ) : (
        <div className="flex flex-col gap-[var(--space-2)]">
          <div className="grid grid-cols-2 gap-[var(--space-2)]">
            {CHIP_DEFS.map((chip) => (
              <div key={chip.color} className="flex items-center gap-2">
                <ChipIcon chip={chip} />
                <input
                  className="input text-center"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  aria-label={`${chip.label} chips for ${player.name}`}
                  placeholder="0"
                  style={{ width: 64, padding: '6px 4px' }}
                  value={chips[chip.color] || ''}
                  onChange={(e) => handleChipChange(chip.color, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            = €{Math.round(chipsTotal)}
          </div>
        </div>
      )}
    </div>
  );
}
