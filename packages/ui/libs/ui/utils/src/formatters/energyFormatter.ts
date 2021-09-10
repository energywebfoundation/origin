import { Unit } from '@energyweb/utils-general';
import { utils, BigNumber, BigNumberish } from 'ethers';

export class EnergyFormatter {
  public static readonly displayUnit = 'MWh';
  public static readonly decimalPlaces = 3;

  static getValueInDisplayUnit(baseValue: BigNumberish): number {
    const valueBN = BigNumber.from(baseValue);

    const whole = valueBN.div(Unit[EnergyFormatter.displayUnit]);
    const mod = valueBN.mod(Unit[EnergyFormatter.displayUnit]);
    return parseFloat(
      `${whole}.${mod.toString().slice(0, EnergyFormatter.decimalPlaces)}`
    );
  }

  static getBaseValueFromValueInDisplayUnit(
    valueInDisplayUnit: number
  ): BigNumber {
    return BigNumber.from(valueInDisplayUnit).mul(
      Unit[EnergyFormatter.displayUnit]
    );
  }

  static format(baseValue: BigNumberish, includeDisplayUnit?: boolean): string {
    const commifiedValue = utils.commify(
      String(EnergyFormatter.getValueInDisplayUnit(BigNumber.from(baseValue)))
    );
    return String(commifiedValue).concat(
      includeDisplayUnit ? ` ${EnergyFormatter.displayUnit}` : ''
    );
  }
}
