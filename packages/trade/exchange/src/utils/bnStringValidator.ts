import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import BN from 'bn.js';

@ValidatorConstraint()
export class BNStringValidator implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            // eslint-disable-next-line no-new
            new BN(text);
        } catch (e) {
            return false;
        }

        return true;
    }
}
