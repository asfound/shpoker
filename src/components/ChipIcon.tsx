import type { CHIP_DEFS } from '@/lib/chips';

interface ChipIconProps {
  chip: (typeof CHIP_DEFS)[number];
}

export function ChipIcon({ chip }: Readonly<ChipIconProps>) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: 32,
        height: 32,
        background: `repeating-conic-gradient(#fff 0deg 14deg, ${chip.bg} 14deg 28deg)`,
        boxShadow: 'var(--shadow-sm)',
      }}
      aria-hidden="true"
    >
      <span
        className="flex items-center justify-center rounded-full"
        style={{ width: 23, height: 23, background: chip.bg }}
      >
        <span
          style={{
            font: '600 10px var(--font-heading)',
            color: chip.fg,
          }}
        >
          {chip.units}
        </span>
      </span>
    </span>
  );
}
