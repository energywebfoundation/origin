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
import { IREC_DEVICE_TYPES, IREC_FUEL_TYPES } from './Fuels';
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
        if (!this.isValidFuelType(newDevice.fuelType)) {
            throw new BadRequestException('Invalid device type');
        }

        if (!this.isValidDeviceType(newDevice.deviceType)) {
            throw new BadRequestException('Invalid fuel type');
        }

        const deviceData: DeviceCreateParams = {
            ...CreateDeviceDTO.sanitize(newDevice),
            registrantOrganization: this.configService.get<string>(
                'IREC_PARTICIPANT_TRADE_ACCOUNT'
            ),
            issuer: this.configService.get<string>('IREC_ISSUER_ORGANIZATION_CODE'),
            active: true
        };

        const irecDevice = await this.irecDeviceService.createIrecDevice(user, {
            ...deviceData,
            address: this.getAddressLine(newDevice)
        });

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

        const updatedDevice = { ...device, ...deviceData };
        const irecDevice = await this.irecDeviceService.update(user, device.code, {
            ...deviceData,
            address: this.getAddressLine(updatedDevice)
        });

        await this.repository.update(device.id, {
            ...irecDevice,
            address: updatedDevice.address,
            status: DeviceState.InProgress
        });

        return this.findOne(id);
    }

    async updateStatus(id: string, status: DeviceState): Promise<void> {
        await this.repository.update(id, { status });
    }

    getFuelTypes(): CodeNameDTO[] {
        return IREC_FUEL_TYPES;
    }

    getDeviceTypes(): CodeNameDTO[] {
        return IREC_DEVICE_TYPES;
    }

    isValidFuelType(deviceType: string): boolean {
        return !!this.getFuelTypes().find((fuel) => fuel.code === deviceType);
    }

    isValidDeviceType(fuelType: string): boolean {
        return !!this.getDeviceTypes().find((fuel) => fuel.code === fuelType);
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
        let irecDevice;
        if (this.irecDeviceService.isIrecIntegrationEnabled()) {
            irecDevice = await this.irecDeviceService.getDevice(user, deviceToImport.code);
        } else {
            [irecDevice] = await this.irecDeviceService.getDevices(user);
        }

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

    getAddressLine(device: CreateDeviceDTO): string {
        return `${device.country}, ${device.postalCode}, ${device.region}, ${device.subregion}`;
    }
}
