import { ReadStream } from 'fs';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
    Logger
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
    CreateAccountParams,
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
import { TUserBaseEntity, UserService } from '@energyweb/origin-backend';

import { CreateConnectionDTO } from './dto';
import { ConnectionDTO, GetConnectionCommand, RefreshTokensCommand } from '../connection';

export type UserIdentifier = ILoggedInUser | string | number;

export interface ICreateBeneficiary {
    name: string;
    countryCode: string;
    location: string;
}

// This needs to be `type` - `interface` doesn't work due to
// https://github.com/microsoft/TypeScript/issues/15300
export type IClaimData = {
    beneficiary: string;
    location: string;
    countryCode: string;
    periodStartDate: string;
    periodEndDate: string;
    purpose: string;

    /** Amount in Wh */
    amount?: string;
};

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

    getAccountInfoByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens
    ): Promise<Account[]>;

    getTradeAccountCode(user: UserIdentifier): Promise<string>;

    getIssueAccountCode(user: UserIdentifier): Promise<string>;

    getRedemptionAccountCode(user: UserIdentifier): Promise<string>;

    createAccount(user: UserIdentifier, params: CreateAccountParams): Promise<void>;

    createAccountByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens,
        params: CreateAccountParams
    ): Promise<void>;

    createIssueRequest(user: UserIdentifier, issue: Issue): Promise<IssueWithStatus>;

    updateIssueRequest(user: UserIdentifier, code: string, issue: Issue): Promise<IssueWithStatus>;

    getIssueRequest(user: UserIdentifier, code: string): Promise<IssueWithStatus>;

    uploadFiles(
        user: UserIdentifier,
        files: { data: Buffer | Blob | ReadStream; filename: string }[]
    ): Promise<string[]>;

    verifyIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void>;

    approveIssueRequest(
        user: UserIdentifier,
        issueRequestCode: string,
        issuerAccountCode: string
    ): Promise<ApproveTransaction>;

    rejectIssueRequest(user: UserIdentifier, issueRequestCode: string): Promise<void>;

    getCertificates(user: UserIdentifier, accountCode?: string): Promise<AccountItem[]>;

    transferCertificate(
        fromUser: UserIdentifier,
        toTradeAccount: string,
        assetId: string,
        fromTradeAccount?: string
    ): Promise<TransactionResult>;

    redeem(
        user: UserIdentifier,
        assetId: string,
        claimData: IClaimData
    ): Promise<RedeemTransactionResult>;

    approveDevice(user: UserIdentifier, deviceId: string): Promise<IrecDevice>;

    rejectDevice(user: UserIdentifier, deviceId: string): Promise<IrecDevice>;

    getUserOrganization(user: UserIdentifier): Promise<Organisation>;

    getUserOrganizationByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens
    ): Promise<Organisation>;
}

@Injectable()
export class IrecService implements IIrecService {
    private platformAdmin: TUserBaseEntity;
    private logger = new Logger(IrecService.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) {}

    public isSingleUserMode(): boolean {
        return this.configService.get<string>('IREC_API_MODE') === 'single';
    }

    public async getConnectionInfo(user: UserIdentifier): Promise<ConnectionDTO> {
        return await this.commandBus.execute(new GetConnectionCommand(user));
    }

    private async getPlatformAdmin(): Promise<TUserBaseEntity> {
        if (!this.platformAdmin) {
            this.platformAdmin = await this.userService.getPlatformAdmin();
        }
        return this.platformAdmin;
    }

    private async getIrecClient(u: UserIdentifier) {
        const user = this.isSingleUserMode() ? (await this.getPlatformAdmin()).organization.id : u;

        const irecConnection = await this.getConnectionInfo(user);

        if (!irecConnection) {
            throw new ForbiddenException('User does not have an IREC connection');
        }

        if (!irecConnection.active) {
            throw new UnauthorizedException(
                'IREC connection is no longer active, please consider update IREC connection credentials'
            );
        }

        const accessTokens: AccessTokens = {
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
            accessTokens
        );
    }

    private async getIrecClientByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens
    ) {
        return new IRECAPIClient(
            this.configService.get<string>('IREC_API_URL'),
            clientId,
            clientSecret,
            undefined,
            tokens
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

    async getRedemptionAccountCode(user: UserIdentifier): Promise<string> {
        const accounts = await this.getAccountInfo(user);
        return (
            accounts.find((account: Account) => account.type === AccountType.Redemption)?.code || ''
        );
    }

    async createAccount(user: UserIdentifier, params: CreateAccountParams): Promise<void> {
        const irecClient = await this.getIrecClient(user);
        await irecClient.account.create(params);
    }

    async createAccountByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens,
        params: CreateAccountParams
    ): Promise<void> {
        const irecClient = await this.getIrecClientByTokens(clientId, clientSecret, tokens);
        await irecClient.account.create(params);
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
        files: { data: Buffer | Blob | ReadStream; filename: string }[]
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

    async getCertificates(user: UserIdentifier, accountCode?: string): Promise<AccountItem[]> {
        const irecClient = await this.getIrecClient(user);
        return irecClient.account.getItems(accountCode || (await this.getTradeAccountCode(user)));
    }

    async transferCertificate(
        fromUser: UserIdentifier,
        toTradeAccount: string,
        assetId: string,
        fromTradeAccount?: string,
        amount?: string
    ): Promise<TransactionResult> {
        const fromUserClient = await this.getIrecClient(fromUser);
        const fromUserConnectionInfo = await this.getConnectionInfo(fromUser);
        const fromUserTradeAccount = fromTradeAccount || (await this.getTradeAccountCode(fromUser));

        const items = await fromUserClient.account.getItems(fromUserTradeAccount);
        const item = items.find((i) => i.asset === assetId);

        if (!item) {
            throw new NotFoundException('IREC item not found');
        }

        const transferItem = new ReservationItem();
        transferItem.code = item.code;

        // Optionally convert Wh to MWh
        transferItem.amount = amount ? Number(amount) / 1_000_000 : item.volume;

        return fromUserClient.transfer({
            sender: fromUserTradeAccount,
            recipient: toTradeAccount,
            approver: fromUserConnectionInfo.userName,
            volume: transferItem.amount,
            items: [transferItem],
            notes: 'Transfer certificate from origin to third-party organization'
        });
    }

    async redeem(
        user: UserIdentifier,
        assetId: string,
        claimData: IClaimData,
        fromTradeAccount?: string,
        toRedemptionAccount?: string
    ): Promise<RedeemTransactionResult> {
        const userClient = await this.getIrecClient(user);
        const userConnectionInfo = await this.getConnectionInfo(user);

        const userTradeAccount = fromTradeAccount || (await this.getTradeAccountCode(user));
        const accountTo = toRedemptionAccount || (await this.getRedemptionAccountCode(user));

        const items = await userClient.account.getItems(userTradeAccount);
        const item = items.find((i) => i.asset === assetId);

        if (!item) {
            const availableAssets = items.map((i) => i.asset).join(', ');
            this.logger.debug(`Asset ${assetId} not found. Available assets: ${availableAssets}`);
            throw new NotFoundException(`IREC item not found.`);
        }

        const claimItem = new ReservationItem();
        claimItem.code = item.code;

        // Optionally convert Wh to MWh
        claimItem.amount = claimData.amount ? Number(claimData.amount) / 1_000_000 : item.volume;

        return userClient.redeem({
            sender: userTradeAccount,
            recipient: accountTo,
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

    async getUserOrganizationByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens
    ): Promise<Organisation> {
        const irecClient = await this.getIrecClientByTokens(clientId, clientSecret, tokens);
        return irecClient.organisation.get();
    }

    async getAccountInfoByTokens(
        clientId: string,
        clientSecret: string,
        tokens: AccessTokens
    ): Promise<Account[]> {
        const irecClient = await this.getIrecClientByTokens(clientId, clientSecret, tokens);
        return irecClient.account.getAll();
    }
}
