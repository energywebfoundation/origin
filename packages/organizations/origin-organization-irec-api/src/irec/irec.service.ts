import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import {
    AccessTokens,
    Account,
    AccountItem,
    AccountType,
    ApproveTransaction,
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
    IssueWithStatus,
    Organisation,
    RedeemTransactionResult,
    ReservationItem,
    TransactionResult
} from '@energyweb/issuer-irec-api-wrapper';
import { ILoggedInUser } from '@energyweb/origin-backend-core';

import { CreateConnectionDTO } from './dto';
import { ConnectionDTO, GetConnectionCommand, RefreshTokensCommand } from '../connection';
import { ReadStream } from 'fs';

export type UserIdentifier = ILoggedInUser | string | number;

export interface ICreateBeneficiary {
    name: string;
    countryCode: string;
    location: string;
}

export interface IClaimData {
    beneficiary: string;
    location: string;
    countryCode: string;
    periodStartDate: string;
    periodEndDate: string;
    purpose: string;
}

export interface IIrecService {
    getConnectionInfo(user: UserIdentifier): Promise<ConnectionDTO>;

    login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens>;

    createBeneficiary(user: UserIdentifier, beneficiary: ICreateBeneficiary): Promise<Beneficiary>;

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

    getIssueAccountCode(user: UserIdentifier): Promise<string>;

    createIssueRequest(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus>;

    updateIssueRequest(user: UserIdentifier, code: string, issue: Issue): Promise<IssueWithStatus>;

    getIssueRequest(user: UserIdentifier, code: string): Promise<IssueWithStatus>;

    uploadFiles(user: UserIdentifier, files: Buffer[] | Blob[] | ReadStream[]): Promise<string[]>;

    verifyIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void>;

    approveIssueRequest(
        user: UserIdentifier,
        issueRequestCode: string,
        issuerAccountCode: string
    ): Promise<ApproveTransaction>;

    rejectIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void>;

    getCertificates(user: UserIdentifier): Promise<AccountItem[]>;

    transferCertificate(
        fromUser: UserIdentifier,
        toUser: UserIdentifier,
        assetId: string
    ): Promise<TransactionResult>;

    redeem(
        user: UserIdentifier,
        assetId: string,
        claimData: IClaimData
    ): Promise<RedeemTransactionResult>;

    approveDevice(user: UserIdentifier, deviceId: string): Promise<IrecDevice>;

    rejectDevice(user: UserIdentifier, deviceId: string): Promise<IrecDevice>;

    getUserOrganization(user: UserIdentifier): Promise<Organisation>;
}

@Injectable()
export class IrecService implements IIrecService {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService
    ) {}

    public async getConnectionInfo(user: UserIdentifier): Promise<ConnectionDTO> {
        return await this.commandBus.execute(new GetConnectionCommand(user));
    }

    private async getIrecClient(user: UserIdentifier) {
        const irecConnection = await this.getConnectionInfo(user);

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        if (!irecConnection.active) {
            throw new UnauthorizedException(
                'IREC connection is no longer active, please consider update IREC connection credentials'
            );
        }

        const accessToken: AccessTokens = {
            accessToken: irecConnection.accessToken,
            refreshToken: irecConnection.refreshToken,
            expiryDate: irecConnection.expiryDate
        };

        return new IRECAPIClient(
            this.configService.get<string>('IREC_API_URL'),
            irecConnection.clientId,
            irecConnection.clientSecret,
            async (newTokens: AccessTokens) => {
                await this.commandBus.execute(new RefreshTokensCommand(user, newTokens));
            },
            accessToken
        );
    }

    async login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens> {
        const client = new IRECAPIClient(
            this.configService.get<string>('IREC_API_URL'),
            clientId,
            clientSecret
        );

        return client.login(userName, password);
    }

    async createBeneficiary(
        user: UserIdentifier,
        beneficiary: ICreateBeneficiary
    ): Promise<Beneficiary> {
        const irecClient = await this.getIrecClient(user);
        return await irecClient.beneficiary.create({
            name: beneficiary.name,
            countryCode: beneficiary.countryCode,
            location: beneficiary.location,
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

    async getIssueAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return accounts.find((account: Account) => account.type === AccountType.Issue)?.code || '';
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

    async verifyIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void> {
        const irecClient = await this.getIrecClient(user);
        await irecClient.issue.verify(issueRequestCode);
    }

    async approveIssueRequest(
        user: UserIdentifier,
        issueRequestCode: string,
        issuerAccountCode: string
    ): Promise<ApproveTransaction> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.issue.approve(issueRequestCode, { issuer: issuerAccountCode });
    }

    async rejectIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.issue.reject(issueRequestCode);
    }

    async getCertificates(user: UserIdentifier): Promise<AccountItem[]> {
        const irecClient = await this.getIrecClient(user);
        const tradeAccountCode = await this.getTradeAccountCode(user);
        return irecClient.account.getItems(tradeAccountCode);
    }

    async transferCertificate(
        fromUser: UserIdentifier,
        toUser: UserIdentifier,
        assetId: string
    ): Promise<TransactionResult> {
        const fromUserClient = await this.getIrecClient(fromUser);
        const fromUserConnectionInfo = await this.getConnectionInfo(fromUser);

        const fromUserTradeAccount = await this.getTradeAccountCode(fromUser);
        const toUserTradeAccount = await this.getTradeAccountCode(toUser);

        const items = await fromUserClient.account.getItems(fromUserTradeAccount);
        const item = items.find((i) => i.asset === assetId);

        if (!item) {
            throw new NotFoundException('IREC item not found');
        }

        const transferItem = new ReservationItem();
        transferItem.code = item.code;
        transferItem.amount = item.volume;

        return fromUserClient.transfer({
            sender: fromUserTradeAccount,
            recipient: toUserTradeAccount,
            approver: fromUserConnectionInfo.userName,
            volume: transferItem.amount,
            items: [transferItem],
            notes: ''
        });
    }

    async redeem(
        user: UserIdentifier,
        assetId: string,
        claimData: IClaimData
    ): Promise<RedeemTransactionResult> {
        const userClient = await this.getIrecClient(user);
        const userConnectionInfo = await this.getConnectionInfo(user);

        const userTradeAccount = await this.getTradeAccountCode(user);

        const items = await userClient.account.getItems(userTradeAccount);
        const item = items.find((i) => i.asset === assetId);

        if (!item) {
            throw new NotFoundException('IREC item not found');
        }

        const claimItem = new ReservationItem();
        claimItem.code = item.code;
        claimItem.amount = item.volume;

        return userClient.redeem({
            sender: userTradeAccount,
            recipient: userTradeAccount,
            approver: userConnectionInfo.userName,
            volume: claimItem.amount,
            items: [claimItem],
            notes: '',
            beneficiary: Number(claimData.beneficiary),
            start: new Date(claimData.periodStartDate),
            end: new Date(claimData.periodEndDate),
            purpose: claimData.purpose
        });
    }

    async approveDevice(user: UserIdentifier, code: string): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        const device = await irecClient.device.get(code);

        const allowedStatuses: string[] = [DeviceState.InProgress, DeviceState.Submitted];
        if (!allowedStatuses.includes(device.status)) {
            throw new Error('To approve IREC device its state has to be In-Progress');
        }

        await irecClient.device.verify(code);
        await irecClient.device.approve(code);

        device.status = DeviceState.Approved;
        return device;
    }

    async rejectDevice(user: UserIdentifier, code: string): Promise<IrecDevice> {
        const irecClient = await this.getIrecClient(user);
        const device = await irecClient.device.get(code);

        if (device.status !== DeviceState.InProgress) {
            throw new Error('To reject IREC device its state have to be In-Progress');
        }

        await irecClient.device.reject(code);
        device.status = DeviceState.Rejected;
        return device;
    }

    async getUserOrganization(user: UserIdentifier): Promise<Organisation> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.organisation.get();
    }
}
