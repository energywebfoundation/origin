import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { bigNumberify } from 'ethers/utils';

@ValidatorConstraint()
export class PositiveBNStringValidator implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            const bn = bigNumberify(text);
            return bn.gt(bigNumberify(0));
        } catch (e) {
            return false;
        }
    }
}
