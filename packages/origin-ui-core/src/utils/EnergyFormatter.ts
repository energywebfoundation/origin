import { Unit } from '@energyweb/utils-general';
import { commify, BigNumber, BigNumberish, bigNumberify } from 'ethers/utils';

export class EnergyFormatter {
    public static readonly displayUnit: string = 'MWh';

    public static readonly decimalPlaces: number = 3;

    static getValueInDisplayUnit(baseValue: BigNumberish): number {
        const bnValue = bigNumberify(baseValue);

        const whole = bnValue.div(Unit[EnergyFormatter.displayUnit]);
        const mod = bnValue.mod(Unit[EnergyFormatter.displayUnit]);
        return parseFloat(`${whole}.${mod.toString().slice(0, EnergyFormatter.decimalPlaces)}`);
    }

    static getBaseValueFromValueInDisplayUnit(valueInDisplayUnit: number): BigNumber {
        return bigNumberify(valueInDisplayUnit * Unit[EnergyFormatter.displayUnit]);
    }

    static format(baseValue: BigNumberish, includeDisplayUnit?: boolean): string {
        const returnValue = bigNumberify(baseValue);
        return `${commify(EnergyFormatter.getValueInDisplayUnit(returnValue).toString())}${
            includeDisplayUnit ? EnergyFormatter.displayUnit : ''
        }`;
    }
}
