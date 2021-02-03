/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments
} from 'class-validator';
import { Filter } from '@energyweb/exchange-core-irec';

@ValidatorConstraint()
export class FilterValidator implements ValidatorConstraintInterface {
    validate(filter: Filter, args: ValidationArguments) {
        try {
            if (filter === Filter.Specific) {
                return args.constraints.every((property) => !!(args.object as any)[property]);
            }

            return true;
        } catch (e) {
            return true;
        }
    }

    defaultMessage() {
        return 'Expected value for filter set as Filter.Specific';
    }
}
