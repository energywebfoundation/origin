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
  ): string {
    return BigNumber.from(valueInDisplayUnit)
      .mul(Unit[PowerFormatter.displayUnit as keyof typeof Unit])
      .toString();
  }

  static format(
    powerInWatt: number | string,
    includeDisplayUnit?: boolean
  ): string {
    return `${PowerFormatter.formatter.format(
      BigNumber.from(powerInWatt)
        .div(Unit[PowerFormatter.displayUnit as keyof typeof Unit])
        .toNumber()
    )}${includeDisplayUnit ? ' ' + PowerFormatter.displayUnit : ''}`;
  }
}
