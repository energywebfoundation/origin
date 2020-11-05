import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import BN from 'bn.js';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint()
@Injectable()
export class IntUnitsOfEnergy implements ValidatorConstraintInterface {
    private energyPerUnit: BN;

    constructor(private readonly configService: ConfigService) {
        this.energyPerUnit = new BN(this.configService.get<string>('ENERGY_PER_UNIT') ?? 1);
    }

    validate(volume: string) {
        if (new BN(volume).mod(this.energyPerUnit).isZero()) {
            return true;
        }
        return false;
    }

    defaultMessage() {
        return 'Energy volume must be integer number of energy units';
    }
}
