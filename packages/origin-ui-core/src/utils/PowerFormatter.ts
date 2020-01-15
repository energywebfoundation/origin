import { Unit } from '@energyweb/utils-general';

export class PowerFormatter {
    static readonly displayUnit: string = 'MW';

    static readonly decimalPlaces: number = 3;

    private static formatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: PowerFormatter.decimalPlaces
    });

    static getBaseValueFromValueInDisplayUnit(valueInDisplayUnit: number): number {
        return valueInDisplayUnit * Unit[PowerFormatter.displayUnit];
    }

    static format(powerInWatt: number, includeDisplayUnit?: boolean): string {
        return `${PowerFormatter.formatter.format(powerInWatt / Unit[PowerFormatter.displayUnit])}${
            includeDisplayUnit ? ' ' + PowerFormatter.displayUnit : ''
        }`;
    }
}
