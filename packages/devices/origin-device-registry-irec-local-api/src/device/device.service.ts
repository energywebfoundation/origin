import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Device } from './device.entity';
import { CodeNameDTO, CreateDeviceDTO, UpdateDeviceDTO } from './dto';
import { DeviceCreatedEvent } from './events';
import { IREC_FUEL_TYPES, IREC_FUELS } from './Fuels';
import { IrecDeviceService } from './irec-device.service';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        private readonly eventBus: EventBus,
        private readonly configService: ConfigService,
        private readonly irecDeviceService: IrecDeviceService
    ) {}

    async findOne(id: string): Promise<Device> {
        return this.repository.findOne(id);
    }

    async create(user: ILoggedInUser, newDevice: CreateDeviceDTO): Promise<Device> {
        if (!this.isValidDeviceType(newDevice.deviceType)) {
            throw new BadRequestException('Invalid device type');
        }

        if (!this.isValidFuelType(newDevice.fuel)) {
            throw new BadRequestException('Invalid fuel type');
        }

        const deviceData = new Device({
            ...CreateDeviceDTO.sanitize(newDevice),
            registrantOrganization: this.configService.get<string>(
                'IREC_PARTICIPANT_TRADE_ACCOUNT'
            ),
            issuer: this.configService.get<string>('IREC_ISSUER_ORGANIZATION_CODE')
        });

        const irecDevice = await this.irecDeviceService.createIrecDevice(user, deviceData);

        const deviceToStore = new Device({
            ...deviceData,
            ...irecDevice,
            ownerId: user.ownerId
        });

        const storedDevice = await this.repository.save(deviceToStore);

        this.eventBus.publish(new DeviceCreatedEvent(storedDevice, user.id));

        return storedDevice;
    }

    async findAll(options?: FindManyOptions<Device>): Promise<Device[]> {
        return this.repository.find(options);
    }

    async update(user: ILoggedInUser, id: string, deviceData: UpdateDeviceDTO): Promise<Device> {
        const device = await this.findOne(id);

        if (!device) {
            return null;
        }

        const irecDevice = await this.irecDeviceService.update(user, device.code, deviceData);
        await this.repository.update(device.id, { ...irecDevice, status: DeviceState.InProgress });

        return this.findOne(id);
    }

    getDeviceTypes(): CodeNameDTO[] {
        return IREC_FUELS;
    }

    getFuelTypes(): CodeNameDTO[] {
        return IREC_FUEL_TYPES;
    }

    isValidDeviceType(deviceType: string): boolean {
        return !!this.getDeviceTypes().find((fuel) => fuel.code === deviceType);
    }

    isValidFuelType(fuelType: string): boolean {
        return !!this.getFuelTypes().find((fuel) => fuel.code === fuelType);
    }
}
