import type { CHIP_DEFS } from '@/lib/chips';

interface ChipIconProps {
  chip: (typeof CHIP_DEFS)[number];
  size?: number;
}

export function ChipIcon({ chip, size = 28 }: ChipIconProps) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `repeating-conic-gradient(#fff 0deg 14deg, ${chip.bg} 14deg 28deg)`,
      }}
      aria-hidden="true"
    >
      <span
        className="flex items-center justify-center rounded-full font-semibold"
        style={{
          width: size * 0.72,
          height: size * 0.72,
          background: chip.bg,
          color: chip.fg,
          fontSize: size * 0.3,
        }}
      >
        {chip.units}
      </span>
    </span>
  );
}
