import { Unit } from '@energyweb/utils-general';
import { BigNumber } from 'ethers';

export class PowerFormatter {
  static readonly displayUnit: string = 'MW';

  static readonly decimalPlaces: number = 3;

  private static formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: PowerFormatter.decimalPlaces,
  });

  static getBaseValueFromValueInDisplayUnit(
    valueInDisplayUnit: number
  ): number {
    return BigNumber.from(valueInDisplayUnit)
      .mul(Unit[PowerFormatter.displayUnit as keyof typeof Unit])
      .toNumber();
  }

  static format(powerInWatt: number, includeDisplayUnit?: boolean): string {
    return `${PowerFormatter.formatter.format(
      powerInWatt / Unit[PowerFormatter.displayUnit as keyof typeof Unit]
    )}${includeDisplayUnit ? ' ' + PowerFormatter.displayUnit : ''}`;
  }
}
