import { Unit } from '@energyweb/utils-general';

export class EnergyFormatter {
    public static readonly displayUnit: string = 'MWh';

    public static readonly decimalPlaces: number = 3;

    public static readonly minValue: number = 1 / 10 ** EnergyFormatter.decimalPlaces;

    private static readonly formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: EnergyFormatter.decimalPlaces
    });

    static getValueInDisplayUnit(baseValue): number {
        return baseValue / Unit[EnergyFormatter.displayUnit];
    }

    static getBaseValueFromValueInDisplayUnit(valueInDisplayUnit: number): number {
        return valueInDisplayUnit * Unit[EnergyFormatter.displayUnit];
    }

    static format(baseValue: number, includeDisplayUnit?: boolean): string {
        return `${EnergyFormatter.formatter.format(
            EnergyFormatter.getValueInDisplayUnit(baseValue)
        )}${includeDisplayUnit ? ' ' + EnergyFormatter.displayUnit : ''}`;
    }
}
