import { DeviceStatus, ILoggedInUser } from '@energyweb/origin-backend-core';
import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Device } from './device.entity';
import { CreateDeviceDTO } from './dto/create-device.dto';
import { DeviceStatusChangedEvent, DeviceCreatedEvent } from './events';

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
}
