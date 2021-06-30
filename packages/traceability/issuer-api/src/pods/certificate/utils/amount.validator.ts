import { ValidatorConstraint } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IntUnitsOfEnergy } from '@energyweb/origin-backend-utils';
import { TOTAL_AMOUNT } from '../types';

@ValidatorConstraint()
@Injectable()
export class AmountValidator extends IntUnitsOfEnergy {
    validate(amount: string) {
        if (amount === TOTAL_AMOUNT) {
            return true;
        }

        return super.validate(amount);
    }
}
