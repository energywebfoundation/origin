import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { bigNumberify, BigNumber } from 'ethers/utils';

@ValidatorConstraint()
export class PositiveBNStringValidator implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            const bn = new BigNumber(text);
            return bn.gt(bigNumberify(0));
        } catch (e) {
            return false;
        }
    }
}
