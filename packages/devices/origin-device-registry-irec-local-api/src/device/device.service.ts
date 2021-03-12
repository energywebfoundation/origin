import {
    Device as IrecDevice,
    DeviceCreateParams,
    DeviceState
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';

import { Device } from './device.entity';
import { CodeNameDTO, CreateDeviceDTO, ImportIrecDeviceDTO, UpdateDeviceDTO } from './dto';
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

        const deviceData: DeviceCreateParams = {
            ...CreateDeviceDTO.sanitize(newDevice),
            registrantOrganization: this.configService.get<string>(
                'IREC_PARTICIPANT_TRADE_ACCOUNT'
            ),
            issuer: this.configService.get<string>('IREC_ISSUER_ORGANIZATION_CODE')
        };

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

    async updateStatus(id: string, status: DeviceState): Promise<void> {
        await this.repository.update(id, { status });
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

    async getDevicesToImport(user: ILoggedInUser): Promise<IrecDevice[]> {
        const irecDevices = await this.irecDeviceService.getDevices(user);
        const devices = await this.repository.find({ where: { ownerId: user.ownerId } });
        const deviceCodes: string[] = devices.map((d) => d.code);

        return irecDevices.filter((d) => !deviceCodes.includes(d.code));
    }

    async importIrecDevice(
        user: ILoggedInUser,
        deviceToImport: ImportIrecDeviceDTO
    ): Promise<Device> {
        const irecDevice = await this.irecDeviceService.getDevice(user, deviceToImport.code);

        if (!irecDevice) {
            throw new NotFoundException(`Device with code ${deviceToImport.code} not found`);
        }

        const device = await this.repository.findOne({ where: { code: deviceToImport.code } });
        if (device) {
            throw new ConflictException(`Device with code ${deviceToImport.code} already exists`);
        }

        const deviceToStore = new Device({
            ...deviceToImport,
            ...irecDevice,
            ownerId: user.ownerId
        });

        const storedDevice = await this.repository.save(deviceToStore);

        this.eventBus.publish(new DeviceCreatedEvent(storedDevice, user.id));

        return storedDevice;
    }
}
