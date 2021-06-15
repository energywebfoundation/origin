import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
    AccessTokens,
    Account,
    AccountType,
    Device,
    IRECAPIClient,
    Issue,
    IssuanceStatus,
    IssueWithStatus,
    DeviceState
} from '@energyweb/issuer-irec-api-wrapper';
import {
    GetConnectionCommand,
    RefreshTokensCommand
} from '@energyweb/origin-organization-irec-api';
import { ReadStream } from 'fs';

export type UserIdentifier = ILoggedInUser | string | number;

@Injectable()
export class IrecService {
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

    async createIrecIssue(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...issue,
                status: IssuanceStatus.InProgress,
                code: 'somecode'
            };
        }
        const irecClient = await this.getIrecClient(user);
        const irecIssue: IssueWithStatus = await irecClient.issue.create(issue);
        await irecClient.issue.submit(irecIssue.code);
        irecIssue.status = IssuanceStatus.InProgress;
        return irecIssue;
    }

    async update(user: UserIdentifier, code: string, issue: Issue): Promise<IssueWithStatus> {
        if (!this.isIrecIntegrationEnabled()) {
            return {
                ...issue,
                status: IssuanceStatus.InProgress,
                code
            } as IssueWithStatus;
        }

        const irecClient = await this.getIrecClient(user);
        const irecIssue = await irecClient.issue.get(code);
        if (irecIssue.status === IssuanceStatus.InProgress) {
            throw new BadRequestException('Issue in "In Progress" state is not available to edit');
        }

        await irecClient.issue.update(code, issue);
        const updatedIredIssue = await irecClient.issue.get(code);
        await irecClient.device.submit(code);
        updatedIredIssue.status = IssuanceStatus.InProgress;
        return updatedIredIssue;
    }

    async getIssue(user: UserIdentifier, code: string): Promise<IssueWithStatus> {
        if (!this.isIrecIntegrationEnabled()) {
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
        const irecClient = await this.getIrecClient(user);
        return irecClient.issue.get(code);
    }

    async getDevice(user: UserIdentifier, code: string): Promise<Device> {
        if (!this.isIrecIntegrationEnabled()) {
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

        const irecClient = await this.getIrecClient(user);
        return irecClient.device.get(code);
    }

    async uploadFiles(user: UserIdentifier, files: Buffer[] | Blob[] | ReadStream[]) {
        if (!this.isIrecIntegrationEnabled()) {
            return files.map(() => ((Math.random() * 1e9) | 0).toString(16));
        }
        const irecClient = await this.getIrecClient(user);
        return irecClient.file.upload(files);
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

    async getCertificates(user: UserIdentifier): Promise<IssueWithStatus[]> {
        // const irecClient = await this.getIrecClient(user);
        // TODO: get certificates somehow
        return [];
    }
}
