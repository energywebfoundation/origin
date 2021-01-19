import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Device } from './device.entity';
import {
    ExternalDeviceAlreadyUsedError,
    SmartMeterAlreadyUsedError,
    UnableToVerifyOwnershipError
} from './errors';
import { NewDeviceDTO } from './new-device.dto';
import { ValidateDeviceOwnershipQuery } from './queries/validate-device-ownership.query';

@Injectable()
export class DeviceRegistryService {
    constructor(
        @InjectRepository(Device) private readonly repository: Repository<Device>,
        private readonly queryBus: QueryBus
    ) {}

    public async find(options?: FindManyOptions<Device>): Promise<Device[]> {
        return this.repository.find(options);
    }

    async findOne(id: string): Promise<Device> {
        return this.repository.findOne(id);
    }

    public async register(user: ILoggedInUser, newDevice: NewDeviceDTO): Promise<string> {
        await this.validateRegistration(user, newDevice);

        const deviceToStore = new Device({
            ...NewDeviceDTO.sanitize(newDevice),
            owner: user.ownerId
        });

        const storedDevice = await this.repository.save(deviceToStore);

        return storedDevice.id;
    }

    private async validateRegistration(
        user: ILoggedInUser,
        { externalRegistryId, smartMeterId }: NewDeviceDTO
    ) {
        const isExternalRegistryIdAlreadyUsed = await this.isExternalRegistryIdAlreadyUsed(
            externalRegistryId
        );

        if (isExternalRegistryIdAlreadyUsed) {
            throw new ExternalDeviceAlreadyUsedError(externalRegistryId);
        }

        const isSmartMeterIdAlreadyUsed = await this.isSmartMeterIdAlreadyUsed(smartMeterId);

        if (isSmartMeterIdAlreadyUsed) {
            throw new SmartMeterAlreadyUsedError(smartMeterId);
        }

        const isOwnerOfTheDevice = await this.queryBus.execute<
            ValidateDeviceOwnershipQuery,
            boolean
        >(new ValidateDeviceOwnershipQuery(user.ownerId, externalRegistryId));

        if (!isOwnerOfTheDevice) {
            throw new UnableToVerifyOwnershipError(user.ownerId, externalRegistryId);
        }
    }

    private async isExternalRegistryIdAlreadyUsed(externalRegistryId: string) {
        const count = await this.repository
            .createQueryBuilder()
            .where('LOWER(externalRegistryId) = LOWER(:externalRegistryId)', {
                externalRegistryId
            })
            .getCount();

        return count > 0;
    }

    private async isSmartMeterIdAlreadyUsed(smartMeterId: string) {
        const count = await this.repository
            .createQueryBuilder()
            .where('LOWER(smartMeterId) = LOWER(:smartMeterId)', {
                smartMeterId
            })
            .getCount();

        return count > 0;
    }
}
