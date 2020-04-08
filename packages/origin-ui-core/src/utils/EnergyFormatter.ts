import { Unit } from '@energyweb/utils-general';
import { BigNumber, BigNumberish, bigNumberify } from 'ethers/utils';

export class EnergyFormatter {
    public static readonly displayUnit: string = 'MWh';

    public static readonly decimalPlaces: number = 3;

    public static readonly minValue: number = 1 / 10 ** EnergyFormatter.decimalPlaces;

    private static readonly formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: EnergyFormatter.decimalPlaces
    });

    static getValueInDisplayUnit(baseValue: BigNumberish): BigNumber {
        const returnValue = bigNumberify(baseValue);
        return returnValue.div(Unit[EnergyFormatter.displayUnit]);
    }

    static getBaseValueFromValueInDisplayUnit(valueInDisplayUnit: BigNumberish): BigNumber {
        const returnValue = bigNumberify(valueInDisplayUnit);
        return returnValue.mul(Unit[EnergyFormatter.displayUnit]);
    }

    static format(baseValue: BigNumberish, includeDisplayUnit?: boolean): string {
        const returnValue = bigNumberify(baseValue);
        return `${EnergyFormatter.formatter.format(
            EnergyFormatter.getValueInDisplayUnit(returnValue).toNumber()
        )}${includeDisplayUnit ? ' ' + EnergyFormatter.displayUnit : ''}`;
    }
}
