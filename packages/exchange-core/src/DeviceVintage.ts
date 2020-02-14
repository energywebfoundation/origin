import { Operator } from './Operator';

export class DeviceVintage {
    constructor(
        public readonly year: number,
        public readonly operator: Operator = Operator.EqualsTo
    ) {}

    public matches(deviceVintage: DeviceVintage) {
        const { year, operator } = deviceVintage;

        switch (operator) {
            case Operator.EqualsTo:
                return this.year === year;
            case Operator.GreaterThanOrEqualsTo:
                return this.year >= year;
            case Operator.LessThanOrEqualsTo:
                return this.year <= year;
            default:
                return false;
        }
    }
}
