import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { BigNumber } from 'ethers';

@ValidatorConstraint()
export class PositiveBNStringValidator implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            const bn = BigNumber.from(text);
            return bn.gt(0);
        } catch (e) {
            return false;
        }
    }
}
