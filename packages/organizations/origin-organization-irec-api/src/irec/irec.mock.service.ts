import { Injectable } from '@nestjs/common';

import {
    AccessTokens,
    Account,
    AccountType,
    Beneficiary,
    BeneficiaryUpdateParams,
    Device,
    Device as IrecDevice,
    DeviceCreateParams,
    DeviceState,
    DeviceUpdateParams,
    IssuanceStatus,
    Issue,
    IssueWithStatus
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';

import { ReadStream } from 'fs';
import { CreateConnectionDTO } from './dto';
import { IIrecService } from './irec.service';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecMockService implements IIrecService {
    async login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens> {
        return {
            expiryDate: new Date(),
            accessToken: 'someAccessToken',
            refreshToken: 'someRefreshToken'
        };
    }

    async createBeneficiary(
        user: UserIdentifier,
        organization: IPublicOrganization
    ): Promise<Beneficiary> {
        return {
            id: 1,
            name: organization.name,
            countryCode: organization.country,
            location: `${organization.city}, ${organization.address}`,
            active: true
        };
    }

    async updateBeneficiary(
        user: UserIdentifier,
        beneficiaryId: number,
        params: BeneficiaryUpdateParams
    ): Promise<Beneficiary> {
        return {
            id: 1,
            name: 'Test Corp',
            countryCode: 'GB',
            location: `Manchester, Lennon street`,
            active: params.active
        };
    }

    async createDevice(user: UserIdentifier, deviceData: DeviceCreateParams): Promise<IrecDevice> {
        return {
            ...deviceData,
            status: DeviceState.InProgress,
            code: ''
        };
    }

    async updateDevice(
        user: UserIdentifier,
        code: string,
        device: DeviceUpdateParams
    ): Promise<IrecDevice> {
        return {
            ...device,
            status: DeviceState.InProgress,
            code
        } as IrecDevice;
    }

    async getDevice(user: UserIdentifier, code: string): Promise<Device> {
        return {
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
        };
    }

    async getDevices(user: UserIdentifier): Promise<IrecDevice[]> {
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

    async getAccountInfo(user: UserIdentifier): Promise<Account[]> {
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

    async getTradeAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return accounts.find((account: Account) => account.type === AccountType.Trade)?.code || '';
    }

    async createIssueRequest(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus> {
        return {
            ...issue,
            status: IssuanceStatus.InProgress,
            code: 'somecode'
        };
    }

    async updateIssueRequest(
        user: UserIdentifier,
        code: string,
        issue: Issue
    ): Promise<IssueWithStatus> {
        return {
            ...issue,
            status: IssuanceStatus.InProgress,
            code
        } as IssueWithStatus;
    }

    async getIssueRequest(user: UserIdentifier, code: string): Promise<IssueWithStatus> {
        return {
            device: 'TESTDEVICE1',
            fuelType: 'ES200',
            recipient: 'SOMEORG',
            start: new Date(),
            end: new Date(),
            production: 1000000,
            notes: '',
            code: '100500',
            status: IssuanceStatus.Approved
        };
    }

    async uploadFiles(user: UserIdentifier, files: Buffer[] | Blob[] | ReadStream[]) {
        return files.map(() => ((Math.random() * 1e9) | 0).toString(16));
    }
}
