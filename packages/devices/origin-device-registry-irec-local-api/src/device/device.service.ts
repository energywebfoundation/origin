import { DeviceStatus, ILoggedInUser } from '@energyweb/origin-backend-core';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Device } from './device.entity';
import { CreateDeviceDTO } from './dto/create-device.dto';
import { DeviceStatusChangedEvent, DeviceCreatedEvent } from './events';
import { IREC_FUEL_TYPES, IREC_FUELS } from './Fuels';
import { CodeNameDTO } from './dto';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        private readonly eventBus: EventBus
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

        const deviceToStore = new Device({
            ...CreateDeviceDTO.sanitize(newDevice),
            ownerId: user.ownerId,
            registrantOrganization: 'MYORG',
            issuer: 'ISSUER'
        });

        const storedDevice = await this.repository.save(deviceToStore);

        this.eventBus.publish(new DeviceCreatedEvent(storedDevice, user.id));

        return storedDevice;
    }

    async findAll(options?: FindManyOptions<Device>): Promise<Device[]> {
        return this.repository.find(options);
    }

    async updateStatus(id: string, status: DeviceStatus): Promise<Device> {
        const device = await this.findOne(id);

        if (!device) {
            return null;
        }

        await this.repository.update(device.id, { status });

        this.eventBus.publish(new DeviceStatusChangedEvent(device, status));

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
