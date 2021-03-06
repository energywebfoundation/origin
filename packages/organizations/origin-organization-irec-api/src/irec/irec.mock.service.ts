import { Injectable, NotFoundException } from '@nestjs/common';

import {
    AccessTokens,
    Account,
    AccountItem,
    AccountType,
    Beneficiary,
    BeneficiaryUpdateParams,
    Device,
    DeviceCreateParams,
    DeviceState,
    DeviceUpdateParams,
    IssuanceStatus,
    Issue,
    IssueWithStatus,
    Transaction,
    TransactionType
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';

import { ReadStream } from 'fs';
import { CreateConnectionDTO } from './dto';
import { IIrecService } from './irec.service';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecMockService implements IIrecService {
    private devices: Device[] = [
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

    private accountInfo: Account[] = [
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

    private issueRequests: IssueWithStatus[] = [
        {
            device: 'TESTDEVICE1',
            fuelType: 'ES200',
            recipient: 'SOMEORG',
            start: new Date(),
            end: new Date(),
            production: 1000000,
            notes: '',
            code: '100500',
            status: IssuanceStatus.Approved
        }
    ];

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

    async createDevice(user: UserIdentifier, deviceData: DeviceCreateParams): Promise<Device> {
        const device = {
            ...deviceData,
            status: DeviceState.InProgress,
            code: randomString()
        };

        this.devices.push(device);
        return device;
    }

    async updateDevice(
        user: UserIdentifier,
        code: string,
        device: DeviceUpdateParams
    ): Promise<Device> {
        const existingDevice = await this.getDevice(user, code);
        const updatedDevice = {
            ...device,
            status: DeviceState.InProgress,
            code
        } as Device;

        if (!existingDevice) {
            this.devices.push(updatedDevice);
            return updatedDevice;
        }

        return Object.assign(existingDevice, updatedDevice);
    }

    async getDevice(user: UserIdentifier, code: string): Promise<Device> {
        return this.devices.find((d) => d.code === code);
    }

    async getDevices(user: UserIdentifier): Promise<Device[]> {
        return this.devices;
    }

    async getAccountInfo(user: UserIdentifier): Promise<Account[]> {
        return this.accountInfo;
    }

    async getTradeAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return accounts.find((account: Account) => account.type === AccountType.Trade)?.code || '';
    }

    async getIssueAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return accounts.find((account: Account) => account.type === AccountType.Issue)?.code || '';
    }

    async createIssueRequest(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus> {
        const issueRequest = {
            ...issue,
            status: IssuanceStatus.InProgress,
            code: randomString()
        };
        this.issueRequests.push(issueRequest);
        return issueRequest;
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
        return this.issueRequests.find((ir) => ir.code === code);
    }

    async uploadFiles(user: UserIdentifier, files: Buffer[] | Blob[] | ReadStream[]) {
        return files.map(() => randomString());
    }

    async verifyIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void> {
        const issueRequest = await this.getIssueRequest(user, issueRequestCode);
        if (!issueRequest) {
            throw new NotFoundException(`Issue request (id=${issueRequestCode}) not found`);
        }
        issueRequest.status = IssuanceStatus.Verified;
    }

    async approveIssueRequest(
        user: UserIdentifier,
        issueRequestCode: string,
        issuerAccountCode: string
    ): Promise<Transaction> {
        return {
            code: `TRANSACTION-${randomString()}`,
            volume: 1000,
            notes: '',
            sender: 'some',
            recipient: 'another',
            time: new Date(),
            transactionType: TransactionType.Issue
        };
    }

    async getCertificates(user: UserIdentifier): Promise<AccountItem[]> {
        return [];
    }

    async approveDevice(user: UserIdentifier, code: string): Promise<Device> {
        const device = await this.getDevice(user, code);

        if (device.status !== DeviceState.InProgress) {
            throw new Error('To approve IREC device its state have to be In-Progress');
        }

        device.status = DeviceState.Approved;
        return device;
    }

    async rejectDevice(user: UserIdentifier, code: string): Promise<Device> {
        const device = await this.getDevice(user, code);

        if (device.status !== DeviceState.InProgress) {
            throw new Error('To reject IREC device its state have to be In-Progress');
        }

        device.status = DeviceState.Rejected;
        return device;
    }
}

function randomString() {
    return (Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
}
