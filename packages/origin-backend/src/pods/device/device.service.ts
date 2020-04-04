import {
    Injectable,
    Inject,
    UnprocessableEntityException,
    BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import {
    ISmartMeterReadingsAdapter,
    ISmartMeterRead,
    IDeviceWithRelationsIds,
    IDevice,
    DeviceCreateData,
    ExternalDeviceId,
    IDeviceProductInfo
} from '@energyweb/origin-backend-core';
import { validate } from 'class-validator';
import { Device } from './device.entity';
import { SM_READS_ADAPTER } from '../../const';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        @Inject(SM_READS_ADAPTER) private smartMeterReadingsAdapter?: ISmartMeterReadingsAdapter
    ) {}

    async findByExternalId(
        externalId: ExternalDeviceId
    ): Promise<ExtendedBaseEntity & IDeviceWithRelationsIds> {
        const devices = ((await this.repository.find({
            loadEagerRelations: true
        })) as IDevice[]) as (ExtendedBaseEntity & IDeviceWithRelationsIds)[];

        return devices.find((device) =>
            device.externalDeviceIds.find(
                (id) => id.id === externalId.id && id.type === externalId.type
            )
        );
    }

    async findOne(
        id: string,
        options: FindOneOptions<Device> = {}
    ): Promise<ExtendedBaseEntity & IDeviceWithRelationsIds> {
        const device = ((await this.repository.findOne(id, {
            loadRelationIds: true,
            ...options
        })) as IDevice) as ExtendedBaseEntity & IDeviceWithRelationsIds;

        if (this.smartMeterReadingsAdapter) {
            device.lastSmartMeterReading = await this.smartMeterReadingsAdapter.getLatest(device);
            device.smartMeterReads = [];
        }

        return device;
    }

    async create(data: DeviceCreateData & Pick<IDeviceWithRelationsIds, 'organization'>) {
        const newEntity = new Device();
        Object.assign(newEntity, data);

        const validationErrors = await validate(newEntity);

        if (validationErrors.length > 0) {
            throw new UnprocessableEntityException({
                success: false,
                errors: validationErrors
            });
        }

        try {
            await this.repository.save(newEntity);

            return newEntity;
        } catch (error) {
            console.warn('Error while saving entity', error);
            throw new BadRequestException('Could not save device.');
        }
    }

    async remove(entity: Device | (ExtendedBaseEntity & IDeviceWithRelationsIds)) {
        this.repository.remove((entity as IDevice) as Device);
    }

    async getAllSmartMeterReadings(id: string) {
        const device = await this.findOne(id);

        if (this.smartMeterReadingsAdapter) {
            return this.smartMeterReadingsAdapter.getAll(device);
        }

        return device.smartMeterReads;
    }

    async addSmartMeterReading(id: string, newSmartMeterRead: ISmartMeterRead): Promise<void> {
        const device = await this.findOne(id);

        if (this.smartMeterReadingsAdapter) {
            this.smartMeterReadingsAdapter.save(device, newSmartMeterRead);
            return;
        }

        const latestSmartMeterReading = (smReads: ISmartMeterRead[]) => smReads[smReads.length - 1];

        if (device.smartMeterReads.length > 0) {
            if (
                newSmartMeterRead.timestamp <=
                latestSmartMeterReading(device.smartMeterReads).timestamp
            ) {
                throw new UnprocessableEntityException({
                    message: `Smart meter reading timestamp should be higher than latest.`
                });
            }
        }

        device.smartMeterReads = [...device.smartMeterReads, newSmartMeterRead];
        device.lastSmartMeterReading = latestSmartMeterReading(device.smartMeterReads);

        await device.save();
    }

    async getAll(
        options: FindOneOptions<Device> = {}
    ): Promise<Array<ExtendedBaseEntity & IDeviceWithRelationsIds>> {
        const devices = ((await this.repository.find({
            loadRelationIds: true,
            ...options
        })) as IDevice[]) as (ExtendedBaseEntity & IDeviceWithRelationsIds)[];

        if (this.smartMeterReadingsAdapter) {
            for (const device of devices) {
                device.lastSmartMeterReading = await this.smartMeterReadingsAdapter.getLatest(
                    device
                );

                device.smartMeterReads = [];
            }
        }

        return devices;
    }

    async findDeviceProductInfo(externalId: ExternalDeviceId): Promise<IDeviceProductInfo> {
        const devices = await this.repository.find();

        return devices.find((device) =>
            device.externalDeviceIds.find(
                (id) => id.id === externalId.id && id.type === externalId.type
            )
        );
    }
}
