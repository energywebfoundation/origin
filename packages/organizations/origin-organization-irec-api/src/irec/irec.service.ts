import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import {
    AccessTokens,
    Account,
    AccountType,
    Beneficiary,
    BeneficiaryUpdateParams,
    Device as IrecDevice,
    DeviceCreateParams,
    DeviceState,
    DeviceUpdateParams,
    IRECAPIClient
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';

import { CreateConnectionDTO } from './dto';
import { GetConnectionCommand, RefreshTokensCommand } from '../connection';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

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

    isIrecIntegrationEnabled(): boolean {
        return !!this.configService.get<string>('IREC_API_URL');
    }

    async login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                expiryDate: new Date(),
                accessToken: 'someAccessToken',
                refreshToken: 'someRefreshToken'
            };
        }

        const client = new IRECAPIClient(process.env.IREC_API_URL);

        return client.login(userName, password, clientId, clientSecret);
    }

    async createBeneficiary(
        user: UserIdentifier,
        organization: IPublicOrganization
    ): Promise<Beneficiary> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                id: 1,
                name: organization.name,
                countryCode: organization.country,
                location: `${organization.city}, ${organization.address}`,
                active: true
            };
        }
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.create({
            name: organization.name,
            countryCode: organization.country,
            location: `${organization.city}. ${organization.address}`,
            active: true
        });
    }

    async updateBeneficiary(
        user: UserIdentifier,
        beneficiaryId: number,
        params: BeneficiaryUpdateParams
    ): Promise<Beneficiary> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                id: 1,
                name: 'Test Corp',
                countryCode: 'GB',
                location: `Manchester, Lennon street`,
                active: params.active
            };
        }
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.update(beneficiaryId, params);
    }

    async createDevice(user: UserIdentifier, deviceData: DeviceCreateParams): Promise<IrecDevice> {
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

    async updateDevice(
        user: UserIdentifier,
        code: string,
        device: DeviceUpdateParams
    ): Promise<IrecDevice> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...device,
                status: DeviceState.InProgress,
                code
            } as IrecDevice;
        }

        const irecClient = await this.getIrecClient(user);
        const irecDevice = await irecClient.device.get(code);
        if (irecDevice.status === DeviceState.InProgress) {
            throw new BadRequestException('Device in "In Progress" state is not available to edit');
        }

        const updatedIredDevice = await irecClient.device.edit(code, device);
        await irecClient.device.submit(code);
        updatedIredDevice.status = DeviceState.InProgress;
        return updatedIredDevice;
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
                    fuelType: 'ES200',
                    issuer: 'someIssuerCode',
                    latitude: '53.405088',
                    longitude: '-1.744222',
                    name: 'DeviceXYZ',
                    notes: 'Lorem ipsum dolor sit amet',
                    registrantOrganization: 'someRegistrantCode',
                    registrationDate: new Date('2001-09-20'),
                    status: DeviceState.Approved,
                    code: 'mockDeviceCode',
                    active: true
                }
            ];
        }
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.getAll();
    }

    async getAccountInfo(user: UserIdentifier): Promise<Account[]> {
        if (!this.isIrecIntegrationEnabled()) {
            return [
                {
                    code: 'TEST001',
                    details: {
                        name: 'Some new revision',
                        private: false,
                        restricted: false,
                        active: true,
                        notes: 'Some test'
                    },
                    type: AccountType.Trade
                },
                {
                    code: 'TESTREDEMPTIONACCOUNT',
                    details: {
                        name: 'Test Account Details 001',
                        private: false,
                        restricted: false,
                        active: true,
                        notes: 'Some test notes'
                    },
                    type: AccountType.Redemption
                }
            ];
        }

        const irecClient = await this.getIrecClient(user);
        return irecClient.account.getAll();
    }

    async getTradeAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return accounts.find((account: Account) => account.type === AccountType.Trade)?.code || '';
    }
}
