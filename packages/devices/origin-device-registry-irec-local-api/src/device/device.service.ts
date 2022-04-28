import { BigNumber } from 'ethers';
import { FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import {
    Device as IrecDevice,
    DeviceCreateParams,
    DeviceState
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { FileService, UserService } from '@energyweb/origin-backend';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';

import { Device } from './device.entity';
import { CodeNameDTO, CreateDeviceDTO, ImportIrecDeviceDTO, UpdateDeviceDTO } from './dto';
import { DeviceCreatedEvent, DeviceStatusChangedEvent } from './events';
import { IREC_DEVICE_TYPES, IREC_FUEL_TYPES } from './Fuels';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        private readonly eventBus: EventBus,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly userService: UserService,
        private readonly fileService: FileService,
        private readonly configService: ConfigService
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
        const irecTradeAccountCode =
            newDevice.irecTradeAccountCode ||
            (await this.irecService.getTradeAccountCode(platformAdmin.organization.id));

        if (!irecTradeAccountCode) {
            throw new InternalServerErrorException(
                'Platform admin IREC account does not have a trade account'
            );
        }

        const registrantOrg = await this.irecService.getUserOrganization(user);

        const deviceData: DeviceCreateParams = {
            ...CreateDeviceDTO.sanitize(newDevice),
            defaultAccount: irecTradeAccountCode,
            registrantOrganization: registrantOrg.code,
            issuer: this.configService.get('IREC_CREATE_DEVICE_ISSUER'),
            active: true
        };

        let fileIds: string[] = [];
        if (newDevice.files && newDevice.files.length > 0) {
            const list = await Promise.all(
                newDevice.files.map((fileId) => this.fileService.get(fileId, user))
            );
            fileIds = await this.irecService.uploadFiles(
                user.organizationId,
                list.map((file) => ({ data: file.data, filename: file.filename }))
            );
        }

        const irecDevice = await this.irecService.createDevice(user, {
            ...deviceData,
            capacity: BigNumber.from(deviceData.capacity).div(1e6).toString(),
            address: this.getAddressLine(newDevice),
            files: fileIds
        });

        const deviceToStore = new Device({
            ...deviceData,
            ...irecDevice,
            files: fileIds,
            irecTradeAccountCode,
            capacity: deviceData.capacity,
            status: DeviceState.InProgress,
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

        if (device.status === DeviceState.Approved) {
            throw new BadRequestException('Approved device is not allowed to edit');
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

    async approveDevice(user: ILoggedInUser, id: string): Promise<Device> {
        const device = await this.findOne(id);

        const allowedStatuses: string[] = [DeviceState.InProgress, DeviceState.Submitted];
        if (!allowedStatuses.includes(device.status)) {
            throw new BadRequestException('Device state have to be in "In-Progress" state');
        }

        await this.irecService.approveDevice(user.organizationId, device.code);
        await this.repository.update(id, { status: DeviceState.Approved });
        device.status = DeviceState.Approved;

        this.eventBus.publish(new DeviceStatusChangedEvent(device, device.status));

        return device;
    }

    async rejectDevice(user: ILoggedInUser, id: string): Promise<Device> {
        const device = await this.findOne(id);

        if (device.status === DeviceState.Draft) {
            throw new BadRequestException('Device state have to be not in "Draft" state');
        }

        await this.irecService.rejectDevice(user.organizationId, device.code);
        await this.repository.update(id, { status: DeviceState.Rejected });
        device.status = DeviceState.Rejected;

        this.eventBus.publish(new DeviceStatusChangedEvent(device, device.status));

        return device;
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

        return irecDevices
            .filter((d) => !deviceCodes.includes(d.code))
            .map((d) => {
                return { ...d, capacity: this.castCapacity(d.capacity) };
            });
    }

    async importIrecDevice(
        user: ILoggedInUser,
        deviceToImport: ImportIrecDeviceDTO
    ): Promise<Device> {
        const irecDevices = await this.irecService.getDevices(user);
        const irecDevice = irecDevices.find((d) => d.code === deviceToImport.code);

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
            capacity: this.castCapacity(irecDevice.capacity),
            ownerId: user.ownerId
        });

        const storedDevice = await this.repository.save(deviceToStore);

        this.eventBus.publish(new DeviceCreatedEvent(storedDevice, user.id));

        return storedDevice;
    }

    getAddressLine(device: CreateDeviceDTO): string {
        return `${device.countryCode}, ${device.postalCode}, ${device.region}, ${device.subregion}`;
    }

    castCapacity(capacity: string) {
        // converting MWH to WH
        // numbers in JS are 64 bits floating point. And Number.MAX_SAFE_INTEGER
        // is 2^53, or about 9e20. So we safely can do such operations without BigInts
        return Math.floor(Number(capacity) * 1e6).toString();
    }
}
