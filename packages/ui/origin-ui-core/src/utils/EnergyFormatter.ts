import { Unit } from '@energyweb/utils-general';
import { utils, BigNumber, BigNumberish } from 'ethers';

export class EnergyFormatter {
    public static readonly displayUnit: string = 'MWh';

    public static readonly decimalPlaces: number = 3;

    static getValueInDisplayUnit(baseValue: BigNumberish): number {
        const bnValue = BigNumber.from(baseValue);

        const whole = bnValue.div(Unit[EnergyFormatter.displayUnit]);
        const mod = bnValue.mod(Unit[EnergyFormatter.displayUnit]);
        return parseFloat(`${whole}.${mod.toString().slice(0, EnergyFormatter.decimalPlaces)}`);
    }

    static getBaseValueFromValueInDisplayUnit(valueInDisplayUnit: number): BigNumber {
        return BigNumber.from(valueInDisplayUnit * Unit[EnergyFormatter.displayUnit]);
    }

    static format(baseValue: BigNumberish, includeDisplayUnit?: boolean): string {
        const returnValue = BigNumber.from(baseValue);
        return `${utils.commify(EnergyFormatter.getValueInDisplayUnit(returnValue).toString())}${
            includeDisplayUnit ? ` ${EnergyFormatter.displayUnit}` : ''
        }`;
    }
}
