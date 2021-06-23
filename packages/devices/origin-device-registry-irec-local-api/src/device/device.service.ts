import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';

import {
    Device as IrecDevice,
    DeviceCreateParams,
    DeviceState
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { UserService } from '@energyweb/origin-backend';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { Device } from './device.entity';
import { CodeNameDTO, CreateDeviceDTO, ImportIrecDeviceDTO, UpdateDeviceDTO } from './dto';
import { DeviceCreatedEvent } from './events';
import { IREC_DEVICE_TYPES, IREC_FUEL_TYPES } from './Fuels';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        private readonly eventBus: EventBus,
        private readonly configService: ConfigService,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly userService: UserService
    ) {}

    async findOne(id: string): Promise<Device> {
        return this.repository.findOne(id);
    }

    async create(user: ILoggedInUser, newDevice: CreateDeviceDTO): Promise<Device> {
        if (!this.isValidDeviceType(newDevice.deviceType)) {
            throw new BadRequestException('Invalid device type');
        }

        if (!this.isValidFuelType(newDevice.fuelType)) {
            throw new BadRequestException('Invalid fuel type');
        }

        const platformAdmin = await this.userService.getPlatformAdmin();
        const tradeAccount = await this.irecService.getTradeAccountCode(platformAdmin.id);
        const deviceData: DeviceCreateParams = {
            ...CreateDeviceDTO.sanitize(newDevice),
            defaultAccount: tradeAccount,
            registrantOrganization: this.configService.get<string>(
                'IREC_PARTICIPANT_TRADE_ACCOUNT'
            ),
            issuer: this.configService.get<string>('IREC_ISSUER_ORGANIZATION_CODE'),
            active: true
        };

        const irecDevice = await this.irecService.createDevice(user, {
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
        const irecDevice = await this.irecService.updateDevice(user, device.code, {
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

    getDeviceTypes(): CodeNameDTO[] {
        return IREC_DEVICE_TYPES;
    }

    getFuelTypes(): CodeNameDTO[] {
        return IREC_FUEL_TYPES;
    }

    isValidDeviceType(deviceType: string): boolean {
        return !!this.getDeviceTypes().find((device) => device.code === deviceType);
    }

    isValidFuelType(fuelType: string): boolean {
        return !!this.getFuelTypes().find((fuel) => fuel.code === fuelType);
    }

    async getDevicesToImport(user: ILoggedInUser): Promise<IrecDevice[]> {
        const irecDevices = await this.irecService.getDevices(user);
        const devices = await this.repository.find({ where: { ownerId: user.ownerId } });
        const deviceCodes: string[] = devices.map((d) => d.code);

        return irecDevices.filter((d) => !deviceCodes.includes(d.code));
    }

    async importIrecDevice(
        user: ILoggedInUser,
        deviceToImport: ImportIrecDeviceDTO
    ): Promise<Device> {
        let [irecDevice] = await this.irecService.getDevices(user);

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
        return `${device.countryCode}, ${device.postalCode}, ${device.region}, ${device.subregion}`;
    }
}
