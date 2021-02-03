/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { GridOperatorService } from '../runner/grid-operator.service';

@Injectable()
@ValidatorConstraint()
export class GridOperatorValidator implements ValidatorConstraintInterface {
    constructor(private readonly gridOperatorService: GridOperatorService) {}

    validate(gridOperators: string[]) {
        return this.gridOperatorService.areValid(gridOperators);
    }

    defaultMessage() {
        return 'Unexpected GridOperators provided';
    }
}
