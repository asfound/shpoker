import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { CHIP_DEFS, computeChipsAmount, emptyChipCounts } from '@/lib/chips';
import type { ChipColor } from '@/lib/chips';
import type { FinalEntry, Player } from '@/types';
import { ChipIcon } from '@/components/ChipIcon';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PlayerSettleRowProps {
  gameId: string;
  player: Player;
}

export function PlayerSettleRow({ gameId, player }: PlayerSettleRowProps) {
  const setFinalEntry = useGameStore((s) => s.setFinalEntry);
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

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium">{player.name}</div>
          <RadioGroup
            value={mode}
            onValueChange={(value) =>
              handleModeChange(value as FinalEntry['mode'])
            }
            className="flex w-auto flex-row gap-3"
          >
            <label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="amount" />
              Amount
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <RadioGroupItem value="chips" />
              Chips
            </label>
          </RadioGroup>
        </div>

        {mode === 'amount' ? (
          <Input
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
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {CHIP_DEFS.map((chip) => (
                <div key={chip.color} className="flex items-center gap-2">
                  <ChipIcon chip={chip} />
                  <Input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    aria-label={`${chip.label} chips for ${player.name}`}
                    placeholder="0"
                    className="w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={chips[chip.color] || ''}
                    onChange={(e) =>
                      handleChipChange(chip.color, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              = €{Math.round(chipsTotal)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
