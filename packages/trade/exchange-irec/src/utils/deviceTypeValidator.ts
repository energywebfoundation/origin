/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { DeviceTypeServiceWrapper } from '../runner/deviceTypeServiceWrapper';

@Injectable()
@ValidatorConstraint()
export class DeviceTypeValidator implements ValidatorConstraintInterface {
    constructor(private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper) {}

    validate(deviceTypes: string[]) {
        const { areValid } = this.deviceTypeServiceWrapper.deviceTypeService.validate(deviceTypes);
        return areValid;
    }

    defaultMessage() {
        return 'Unexpected DeviceTypes provided';
    }
}
