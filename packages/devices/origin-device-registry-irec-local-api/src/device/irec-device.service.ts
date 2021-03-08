import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
    AccessTokens,
    Device as IrecDevice,
    DeviceCreateUpdateParams,
    DeviceState,
    IRECAPIClient
} from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand
} from '@energyweb/origin-organization-irec-api';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecDeviceService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    isIrecIntegrationEnabled(): boolean {
        return !!this.configService.get<string>('IREC_API_URL');
    }

    private async getIrecClient(user: UserIdentifier | string | number) {
        const irecConnection = await this.commandBus.execute(new GetConnectionCommand(user));

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        const client = new IRECAPIClient(this.configService.get<string>('IREC_API_URL'), {
            accessToken: irecConnection.accessToken,
            refreshToken: irecConnection.refreshToken,
            expiryDate: irecConnection.expiryDate
        });

        client.on('tokensRefreshed', (accessToken: AccessTokens) => {
            this.commandBus.execute(new RefreshTokensCommand(user, accessToken));
        });

        return client;
    }

    async createIrecDevice(
        user: UserIdentifier,
        deviceData: DeviceCreateUpdateParams
    ): Promise<IrecDevice> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...deviceData,
                status: DeviceState.InProgress,
                code: ''
            };
        }
        const irecClient = await this.getIrecClient(user);
        const irecDevice = await irecClient.device.create(deviceData);
        await irecClient.device.submit(irecDevice.code);
        irecDevice.status = DeviceState.InProgress;
        return irecDevice;
    }

    async update(
        user: UserIdentifier,
        code: string,
        device: Partial<IrecDevice>
    ): Promise<IrecDevice> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...device,
                status: DeviceState.InProgress,
                code
            };
        }
        const irecClient = await this.getIrecClient(user);
        const iredDevice = await irecClient.device.edit(code, device);
        await irecClient.device.submit(code);
        iredDevice.status = DeviceState.InProgress;
        return iredDevice;
    }

    async getDevice(user: UserIdentifier, code: string): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.get(code);
    }

    async getDevices(user: UserIdentifier): Promise<IrecDevice[]> {
        if (!this.isIrecIntegrationEnabled()) {
            return [
                {
                    address: '1 Wind Farm Avenue, London',
                    capacity: 500,
                    commissioningDate: new Date('2001-08-10'),
                    countryCode: 'GB',
                    defaultAccount: 'someTradeAccount',
                    deviceType: 'TC110',
                    fuel: 'ES200',
                    issuer: 'someIssuerCode',
                    latitude: '53.405088',
                    longitude: '-1.744222',
                    name: 'DeviceXYZ',
                    notes: 'Lorem ipsum dolor sit amet',
                    registrantOrganization: 'someRegistrantCode',
                    registrationDate: new Date('2001-09-20'),
                    status: DeviceState.Approved,
                    code: 'mockDeviceCode'
                }
            ];
        }
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.getAll();
    }
}
