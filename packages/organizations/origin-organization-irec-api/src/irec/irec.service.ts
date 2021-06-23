import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

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
    IRECAPIClient,
    IssuanceStatus,
    Issue,
    IssueWithStatus
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser, IPublicOrganization } from '@energyweb/origin-backend-core';

import { CreateConnectionDTO } from './dto';
import { GetConnectionCommand, RefreshTokensCommand } from '../connection';
import { ReadStream } from 'fs';

export type UserIdentifier = ILoggedInUser | string | number;

export interface IIrecService {
    login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens>;

    createBeneficiary(
        user: UserIdentifier,
        organization: IPublicOrganization
    ): Promise<Beneficiary>;

    updateBeneficiary(
        user: UserIdentifier,
        beneficiaryId: number,
        params: BeneficiaryUpdateParams
    ): Promise<Beneficiary>;

    createDevice(user: UserIdentifier, deviceData: DeviceCreateParams): Promise<IrecDevice>;

    updateDevice(
        user: UserIdentifier,
        code: string,
        device: DeviceUpdateParams
    ): Promise<IrecDevice>;

    getDevice(user: UserIdentifier, code: string): Promise<Device>;

    getDevices(user: UserIdentifier): Promise<IrecDevice[]>;

    getAccountInfo(user: UserIdentifier): Promise<Account[]>;

    getTradeAccountCode(user: UserIdentifier): Promise<string>;

    createIssueRequest(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus>;

    updateIssueRequest(user: UserIdentifier, code: string, issue: Issue): Promise<IssueWithStatus>;

    getIssueRequest(user: UserIdentifier, code: string): Promise<IssueWithStatus>;

    uploadFiles(user: UserIdentifier, files: Buffer[] | Blob[] | ReadStream[]): Promise<string[]>;
}

@Injectable()
export class IrecService implements IIrecService {
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
        return true;
    }

    async login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens> {
        const client = new IRECAPIClient(this.configService.get<string>('IREC_API_URL'));

        return client.login(userName, password, clientId, clientSecret);
    }

    async createBeneficiary(
        user: UserIdentifier,
        organization: IPublicOrganization
    ): Promise<Beneficiary> {
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
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.update(beneficiaryId, params);
    }

    async createDevice(user: UserIdentifier, deviceData: DeviceCreateParams): Promise<IrecDevice> {
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

    async getDevice(user: UserIdentifier, code: string): Promise<Device> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.get(code);
    }

    async getDevices(user: UserIdentifier): Promise<IrecDevice[]> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.device.getAll();
    }

    async getAccountInfo(user: UserIdentifier): Promise<Account[]> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.account.getAll();
    }

    async getTradeAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return accounts.find((account: Account) => account.type === AccountType.Trade)?.code || '';
    }

    async createIssueRequest(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus> {
        const irecClient = await this.getIrecClient(user);
        const irecIssue: IssueWithStatus = await irecClient.issue.create(issue);
        await irecClient.issue.submit(irecIssue.code);
        irecIssue.status = IssuanceStatus.InProgress;
        return irecIssue;
    }

    async updateIssueRequest(
        user: UserIdentifier,
        code: string,
        issue: Issue
    ): Promise<IssueWithStatus> {
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

    async getIssueRequest(user: UserIdentifier, code: string): Promise<IssueWithStatus> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.issue.get(code);
    }

    async uploadFiles(
        user: UserIdentifier,
        files: Buffer[] | Blob[] | ReadStream[]
    ): Promise<string[]> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.file.upload(files);
    }
}
