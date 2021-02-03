import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { utils } from 'ethers';

@ValidatorConstraint()
export class ETHAddressValidator implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            utils.getAddress(text);
        } catch (e) {
            return false;
        }

        return true;
    }
}
