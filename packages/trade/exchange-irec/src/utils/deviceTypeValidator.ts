/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { IDeviceTypeService } from '@energyweb/utils-general';
import { DeviceTypeServiceWrapper } from '../runner';

@Injectable()
@ValidatorConstraint()
export class DeviceTypeValidator implements ValidatorConstraintInterface, OnModuleInit {
    private deviceTypeService: IDeviceTypeService;
    constructor(private readonly deviceTypeServiceWrapper: DeviceTypeServiceWrapper) {}

    public async onModuleInit() {
        this.deviceTypeService = await this.deviceTypeServiceWrapper.getDeviceTypeService();
    }

    validate(deviceTypes: string[]) {
        const { areValid } = this.deviceTypeService.validate(deviceTypes);
        return areValid;
    }

    defaultMessage() {
        return 'Unexpected DeviceTypes provided';
    }
}
