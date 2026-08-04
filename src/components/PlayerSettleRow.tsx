import { useState } from 'react';
import { findGame, useGameStore } from '@/store/gameStore';
import { CHIP_DEFS, computeChipsAmount, emptyChipCounts } from '@/lib/chips';
import type { ChipColor } from '@/lib/chips';
import { toNonNegativeInt } from '@/lib/number';
import type { FinalEntry, Player } from '@/types';
import { ChipIcon } from '@/components/ChipIcon';

interface PlayerSettleRowProps {
  gameId: string;
  player: Player;
}

function describeDiff(diff: number): { label: string; color: string } {
  if (diff > 0) {
    return { label: `+€${diff}`, color: 'var(--color-accent-300)' };
  }
  if (diff < 0) {
    return {
      label: `−€${Math.abs(diff)}`,
      color: 'color-mix(in srgb, var(--color-text) 65%, transparent)',
    };
  }
  return {
    label: '€0',
    color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
  };
}

export function PlayerSettleRow({
  gameId,
  player,
}: Readonly<PlayerSettleRowProps>) {
  const setFinalEntry = useGameStore((s) => s.setFinalEntry);
  const buyInsTotal = useGameStore(
    (s) =>
      findGame(s.games, gameId)
        ?.buyIns.filter((b) => b.playerId === player.id)
        .reduce((sum, b) => sum + b.amount, 0) ?? 0,
  );

  const [storedEntry] = useState(
    () =>
      findGame(useGameStore.getState().games, gameId)?.finalEntries[player.id],
  );

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
        amount: toNonNegativeInt(amount),
      });
    } else {
      setFinalEntry(gameId, player.id, { mode: 'chips', chips });
    }
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    setFinalEntry(gameId, player.id, {
      mode: 'amount',
      amount: toNonNegativeInt(value),
    });
  }

  function handleChipChange(color: ChipColor, value: string) {
    const nextChips = { ...chips, [color]: toNonNegativeInt(value) };
    setChips(nextChips);
    setFinalEntry(gameId, player.id, { mode: 'chips', chips: nextChips });
  }

  const chipsTotal = computeChipsAmount(chips);
  const finalAmount = mode === 'amount' ? toNonNegativeInt(amount) : chipsTotal;
  const diff = Math.round(finalAmount - buyInsTotal);
  const { label: diffLabel, color: diffColor } = describeDiff(diff);

  const radioName = `settle-mode-${player.id}`;

  return (
    <div className="card elev-sm gap-(--space-3) p-(--space-3)">
      <div className="flex items-start justify-between gap-(--space-3)">
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
        <div className="flex flex-col gap-(--space-2)">
          <div className="grid grid-cols-2 gap-(--space-2)">
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
