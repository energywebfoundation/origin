import { DeviceStatus, ILoggedInUser } from '@energyweb/origin-backend-core';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import {
    AccessTokens,
    DeviceCreateUpdateParams,
    IRECAPIClient,
    Device as IrecDevice
} from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand,
    RegistrationService
} from '@energyweb/origin-organization-irec-api';

import { Device } from './device.entity';
import { CodeNameDTO, CreateDeviceDTO } from './dto';
import { DeviceCreatedEvent, DeviceStatusChangedEvent } from './events';
import { IREC_FUEL_TYPES, IREC_FUELS } from './Fuels';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly repository: Repository<Device>,
        private readonly eventBus: EventBus,
        private readonly registrationService: RegistrationService,
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    private async getIrecClient(user: ILoggedInUser) {
        const [irecConnection] = await this.commandBus.execute(new GetConnectionCommand(user));

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        const client = new IRECAPIClient(process.env.IREC_API_URL, {
            accessToken: irecConnection.accessToken,
            refreshToken: irecConnection.refreshToken,
            expiryDate: irecConnection.expiryDate
        });

        client.on('tokensRefreshed', (accessToken: AccessTokens) => {
            this.commandBus.execute(new RefreshTokensCommand(user, accessToken));
        });

        return client;
    }

    async findOne(id: string): Promise<Device> {
        return this.repository.findOne(id);
    }

    async create(user: ILoggedInUser, newDevice: CreateDeviceDTO): Promise<Device> {
        const deviceData: DeviceCreateUpdateParams = {
            ...CreateDeviceDTO.sanitize(newDevice),
            registrantOrganization: this.configService.get<string>(
                'IREC_PARTICIPANT_TRADE_ACCOUNT'
            ),
            issuer: this.configService.get<string>('IREC_ISSUER_ORGANIZATION_CODE')
        };

        const irecDevice = await this.createIrecDevice(user, deviceData);

        const deviceToStore = new Device({
            ...deviceData,
            code: irecDevice.code,
            ownerId: user.ownerId
        });

        const storedDevice = await this.repository.save(deviceToStore);

        this.eventBus.publish(new DeviceCreatedEvent(storedDevice, user.id));

        return storedDevice;
    }

    private async createIrecDevice(
        user: ILoggedInUser,
        deviceData: DeviceCreateUpdateParams
    ): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.create(deviceData);
    }

    async findAll(options?: FindManyOptions<Device>): Promise<Device[]> {
        return this.repository.find(options);
    }

    async updateStatus(id: string, status: DeviceStatus): Promise<Device> {
        // TODO: change it. IREC logic is different
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
}
