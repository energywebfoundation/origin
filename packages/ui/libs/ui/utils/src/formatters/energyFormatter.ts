import { Unit } from '@energyweb/utils-general';
import { utils, BigNumber, BigNumberish } from 'ethers';
import { toBN } from '../convert';

export class EnergyFormatter {
  public static readonly displayUnit = 'MWh';
  public static readonly decimalPlaces = 3;

  static getValueInDisplayUnit(baseValue: BigNumberish): number {
    const valueBN = toBN(baseValue);

    const whole = valueBN.div(Unit[EnergyFormatter.displayUnit]);
    const mod = valueBN.mod(Unit[EnergyFormatter.displayUnit]);
    return parseFloat(
      `${whole}.${mod.toString().slice(0, EnergyFormatter.decimalPlaces)}`
    );
  }

  static getBaseValueFromValueInDisplayUnit(
    valueInDisplayUnit: number
  ): BigNumber {
    return toBN(valueInDisplayUnit).mul(Unit[EnergyFormatter.displayUnit]);
  }

  static format(baseValue: BigNumberish, includeDisplayUnit?: boolean): string {
    const commifiedValue = utils.commify(
      String(EnergyFormatter.getValueInDisplayUnit(toBN(baseValue)))
    );
    return String(commifiedValue).concat(
      includeDisplayUnit ? ` ${EnergyFormatter.displayUnit}` : ''
    );
  }
}
