export const CHIP_DEFS = [
  {
    color: 'black',
    label: 'Black',
    units: 100,
    value: 1,
    bg: '#1a1a1a',
    fg: '#ffffff',
  },
  {
    color: 'blue',
    label: 'Blue',
    units: 50,
    value: 0.5,
    bg: '#1a4fa0',
    fg: '#ffffff',
  },
  {
    color: 'green',
    label: 'Green',
    units: 25,
    value: 0.25,
    bg: '#1e7a3d',
    fg: '#ffffff',
  },
  {
    color: 'red',
    label: 'Red',
    units: 10,
    value: 0.1,
    bg: '#c1272d',
    fg: '#ffffff',
  },
] as const;

export type ChipColor = (typeof CHIP_DEFS)[number]['color'];
export type ChipCounts = Record<ChipColor, number>;

export function emptyChipCounts(): ChipCounts {
  return { black: 0, blue: 0, green: 0, red: 0 };
}

export function computeChipsAmount(chips: ChipCounts): number {
  return CHIP_DEFS.reduce(
    (sum, chip) => sum + (chips[chip.color] || 0) * chip.value,
    0,
  );
}
