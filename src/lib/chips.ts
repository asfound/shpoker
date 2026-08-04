export const CHIP_DEFS = [
  {
    color: 'black',
    label: 'Black',
    units: 100,
    value: 1,
    bg: '#242424',
    fg: '#f3f5fe',
  },
  {
    color: 'blue',
    label: 'Blue',
    units: 50,
    value: 0.5,
    bg: '#3d5a99',
    fg: '#f3f5fe',
  },
  {
    color: 'green',
    label: 'Green',
    units: 25,
    value: 0.25,
    bg: '#3f7a53',
    fg: '#f3f5fe',
  },
  {
    color: 'red',
    label: 'Red',
    units: 10,
    value: 0.1,
    bg: '#a2564e',
    fg: '#f3f5fe',
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
