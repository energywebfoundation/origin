import { PaletteMode } from '@material-ui/core';

/* eslint-disable no-bitwise */
export function LightenColor(
  color: string,
  percent: number,
  themeMode?: PaletteMode
): string {
  let formattedPercent = percent;

  if (themeMode) {
    formattedPercent = themeMode === 'dark' ? percent : -percent;
  }

  if (color) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * formattedPercent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;

    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  return formattedPercent > 0 ? '#ffffff' : '#000000';
}

type THexToRGBA = (hexCode: string, opacity: number) => string;
export const HexToRGBA: THexToRGBA = (hexCode, opacity) => {
  let hex = hexCode.replace('#', '');

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${opacity / 100})`;
};
