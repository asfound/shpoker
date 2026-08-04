import { describe, expect, it } from 'vitest';
import { computeChipsAmount, emptyChipCounts } from '@/lib/chips';

describe('emptyChipCounts', () => {
  it('starts every denomination at 0', () => {
    expect(emptyChipCounts()).toEqual({
      black: 0,
      blue: 0,
      green: 0,
      red: 0,
    });
  });
});

describe('computeChipsAmount', () => {
  it('is 0 for empty chips', () => {
    expect(computeChipsAmount(emptyChipCounts())).toBe(0);
  });

  it('sums each denomination at its euro value', () => {
    // 2 black (€1) + 1 blue (€0.5) + 4 green (€0.25) + 5 red (€0.10)
    const total = computeChipsAmount({ black: 2, blue: 1, green: 4, red: 5 });
    expect(total).toBe(4);
  });

  it('ignores missing keys instead of throwing', () => {
    const total = computeChipsAmount({} as ReturnType<typeof emptyChipCounts>);
    expect(total).toBe(0);
  });
});
