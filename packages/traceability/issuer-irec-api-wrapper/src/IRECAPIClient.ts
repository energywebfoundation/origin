/* eslint-disable camelcase */
import 'reflect-metadata';

import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { classToPlain, plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import FormData from 'form-data';
import { ReadStream } from 'fs';
import qs from 'qs';
import EventEmitter from 'events';

import {
    Account,
    AccountBalance,
    ApproveTransaction,
    RedeemTransaction,
    RedeemTransactionResult,
    Transaction,
    TransactionResult,
    TransactionType
} from './Account';
import { Device, DeviceUpdateParams, DeviceCreateParams } from './Device';
import { ApproveIssue, Issue, IssueWithStatus } from './Issue';
import { Redemption, Transfer } from './Transfer';
import { AccountItem, CodeName } from './Items';
import { FuelType, DeviceType } from './FuelType';
import { Organisation } from './Organisation';
import { Beneficiary, BeneficiaryCreateParams, BeneficiaryUpdateParams } from './Beneficiary';

export type AccessTokens = {
    expiryDate: Date;
    accessToken: string;
    refreshToken: string;
};

export declare interface IRECAPIClient {
    on(event: 'tokensRefreshed', listener: (accessTokens: AccessTokens) => void): this;
}

export class IRECAPIClient extends EventEmitter {
    private config: AxiosRequestConfig;

    private interceptorId = NaN;

    private axiosInstance: AxiosInstance;

    public constructor(private readonly endPointUrl: string, private accessTokens?: AccessTokens) {
        super();
        this.axiosInstance = axios.create({
            baseURL: endPointUrl,
            timeout: 30000
        });

        this.enableInterceptor();
        this.enableErrorHandler();
    }

    public async login(
        userName: string,
        password: string,
        clientId: string,
        clientSecret: string
    ): Promise<AccessTokens> {
        const url = `${this.endPointUrl}/api/token`;

        this.disableInterceptor();
        const response = await this.axiosInstance.post<{
            expires_in: number;
            access_token: string;
            refresh_token: string;
        }>(
            url,
            qs.stringify({
                grant_type: 'password',
                username: userName,
                password,
                client_id: clientId,
                client_secret: clientSecret,
                scope: ''
            })
        );
        this.enableInterceptor();

        this.applyTokens(
            response.data.access_token,
            response.data.refresh_token,
            response.data.expires_in
        );

        return this.accessTokens;
    }

    public get account() {
        const accountManagementUrl = `${this.endPointUrl}/api/irec/v1/account-management`;

        return {
            getAll: async (): Promise<Account[]> => {
                const response = await this.axiosInstance.get<unknown[]>(
                    accountManagementUrl,
                    this.config
                );

                return response.data.map((account) => plainToClass(Account, account));
            },
            get: async (code: string): Promise<Account> => {
                const url = `${accountManagementUrl}/${code}`;

                const response = await this.axiosInstance.get<unknown>(url, this.config);

                return plainToClass(Account, response.data);
            },
            getBalance: async (code: string): Promise<AccountBalance[]> => {
                const url = `${accountManagementUrl}/${code}/balance`;

                const response = await this.axiosInstance.get<unknown[]>(url, this.config);

                return response.data.map((account) => plainToClass(AccountBalance, account));
            },
            getTransactions: async (
                code: string
            ): Promise<Array<Transaction | RedeemTransaction>> => {
                const url = `${accountManagementUrl}/${code}/transactions`;

                const response = await this.axiosInstance.get<any[]>(url, this.config);

                return response.data.map((transaction) => {
                    if (transaction.transaction_type.code === TransactionType.Redemption) {
                        return plainToClass(RedeemTransaction, transaction);
                    }

                    return plainToClass(Transaction, transaction);
                });
            },
            getItems: async (code: string): Promise<AccountItem[]> => {
                const url = `${accountManagementUrl}/${code}/items`;

                const response = await this.axiosInstance.get<unknown[]>(url, this.config);

                return response.data.map((item) => plainToClass(AccountItem, item));
            }
        };
    }

    public get organisation() {
        const organisationUrl = `${this.endPointUrl}/api/irec/v1/organisation`;

        return {
            get: async (): Promise<Organisation> => {
                const response = await this.axiosInstance.get<unknown>(
                    organisationUrl,
                    this.config
                );

                return plainToClass(Organisation, response.data);
            },
            getRegistrants: async (): Promise<CodeName[]> => {
                const response = await this.axiosInstance.get<unknown[]>(
                    `${organisationUrl}/registrants`,
                    this.config
                );

                return response.data.map((org) => plainToClass(CodeName, org));
            },
            getIssuers: async (): Promise<CodeName[]> => {
                const response = await this.axiosInstance.get<unknown[]>(
                    `${organisationUrl}/issuers`,
                    this.config
                );

                return response.data.map((org) => plainToClass(CodeName, org));
            }
        };
    }

    public get issue() {
        const issueManagementUrl = `${this.endPointUrl}/api/irec/v1/issue-management`;

        const setState = async (code: string, action: string, notes?: string) => {
            const url = `${issueManagementUrl}/${code}/${action}`;

            await this.axiosInstance.put(url, { notes }, this.config);
        };

        return {
            create: async (issue: Issue): Promise<IssueWithStatus> => {
                const issueParams = issue instanceof Issue ? issue : plainToClass(Issue, issue);
                await validateOrReject(issue);

                const url = `${issueManagementUrl}/create`;
                const response = await this.axiosInstance.post<IssueWithStatus>(
                    url,
                    classToPlain(issueParams),
                    this.config
                );

                return response.data;
            },
            update: async (code: string, issue: Issue): Promise<void> => {
                await validateOrReject(issue, { skipMissingProperties: true });

                const url = `${issueManagementUrl}/${code}/edit`;

                await this.axiosInstance.put(url, classToPlain(issue), this.config);
            },
            get: async (code: string): Promise<IssueWithStatus> => {
                const url = `${issueManagementUrl}/${code}`;

                const response = await this.axiosInstance.get<unknown>(url, this.config);

                return plainToClass(IssueWithStatus, response.data);
            },
            submit: async (code: string, notes?: string): Promise<void> => {
                await setState(code, 'submit', notes);
            },
            verify: async (code: string, notes?: string): Promise<void> => {
                await setState(code, 'verify', notes);
            },
            refer: async (code: string, notes?: string): Promise<void> => {
                await setState(code, 'refer', notes);
            },
            reject: async (code: string, notes?: string): Promise<void> => {
                await setState(code, 'reject', notes);
            },
            withdraw: async (code: string, notes?: string): Promise<void> => {
                await setState(code, 'withdraw', notes);
            },
            approve: async (code: string, approve: ApproveIssue): Promise<ApproveTransaction> => {
                const appr =
                    approve instanceof ApproveIssue ? approve : plainToClass(ApproveIssue, approve);

                await validateOrReject(approve);

                const url = `${issueManagementUrl}/${code}/approve`;

                const response = await this.axiosInstance.put<any>(
                    url,
                    classToPlain(appr),
                    this.config
                );

                const asset = response.data.asset;
                return plainToClass(ApproveTransaction, { ...response.data.transaction, asset });
            },
            getStatus: async (code: string): Promise<IssueWithStatus> => {
                const url = `${issueManagementUrl}/${code}`;

                const response = await this.axiosInstance.get<unknown>(url, this.config);

                return plainToClass(IssueWithStatus, response.data);
            }
        };
    }

    public get beneficiary() {
        const beneficiaryManagementUrl = `${this.endPointUrl}/api/irec/v1/beneficiaries`;

        return {
            create: async (params: BeneficiaryCreateParams): Promise<Beneficiary> => {
                const beneficiaryParams =
                    params instanceof BeneficiaryCreateParams
                        ? params
                        : plainToClass(BeneficiaryCreateParams, params);

                await validateOrReject(beneficiaryParams);

                const url = `${beneficiaryManagementUrl}/create`;
                const response = await this.axiosInstance.post<unknown>(
                    url,
                    classToPlain(beneficiaryParams),
                    this.config
                );

                return plainToClass(Beneficiary, response.data);
            },
            update: async (
                id: string | number,
                params: BeneficiaryUpdateParams
            ): Promise<Beneficiary> => {
                const beneficiaryParams =
                    params instanceof BeneficiaryUpdateParams
                        ? params
                        : plainToClass(BeneficiaryUpdateParams, params);

                await validateOrReject(beneficiaryParams);

                const url = `${beneficiaryManagementUrl}/${id}`;

                const response = await this.axiosInstance.put<unknown>(
                    url,
                    classToPlain(beneficiaryParams),
                    this.config
                );

                return plainToClass(Beneficiary, response.data);
            },
            get: async (id: string | number): Promise<Beneficiary> => {
                const url = `${beneficiaryManagementUrl}/${id}`;

                const response = await this.axiosInstance.get<unknown>(url, this.config);

                return plainToClass(Beneficiary, response.data);
            },
            getAll: async (): Promise<Beneficiary[]> => {
                const response = await this.axiosInstance.get<unknown[]>(
                    beneficiaryManagementUrl,
                    this.config
                );

                return response.data.map((b) => plainToClass(Beneficiary, b));
            }
        };
    }

    public get file() {
        const fileManagementUrl = `${this.endPointUrl}/api/irec/v1/file-management`;

        return {
            upload: async (files: Buffer[] | Blob[] | ReadStream[]): Promise<string[]> => {
                const url = `${fileManagementUrl}/upload`;

                const data = new FormData();
                files.forEach((file: Buffer | Blob | ReadStream) => data.append('files', file));

                const headers = data.getHeaders();
                const response = await this.axiosInstance.post<{ file_uids: string[] }>(url, data, {
                    headers: { ...headers, ...this.config.headers }
                });

                return response.data.file_uids;
            },
            download: async (code: string): Promise<string> => {
                const url = `${fileManagementUrl}/${code}/download`;

                const response = await this.axiosInstance.get<{ url: string }>(url, this.config);

                return response.data.url;
            }
        };
    }

    public get device() {
        const deviceManagementUrl = `${this.endPointUrl}/api/irec/v1/device-management`;

        return {
            create: async (device: DeviceCreateParams): Promise<Device> => {
                const dev =
                    device instanceof DeviceCreateParams
                        ? device
                        : plainToClass(DeviceCreateParams, device);

                await validateOrReject(dev);

                const url = `${deviceManagementUrl}/create`;
                const response = await this.axiosInstance.post(url, classToPlain(dev), this.config);

                return plainToClass(Device, response.data?.device);
            },
            edit: async (code: string, device: Partial<DeviceUpdateParams>): Promise<Device> => {
                const dev =
                    device instanceof DeviceUpdateParams
                        ? device
                        : plainToClass(DeviceUpdateParams, device);

                await validateOrReject(dev, { skipMissingProperties: true });

                const url = `${deviceManagementUrl}/${code}/edit`;
                const response = await this.axiosInstance.put(url, classToPlain(dev), this.config);
                return plainToClass(Device, response.data?.device);
            },
            getAll: async (): Promise<Device[]> => {
                const response = await this.axiosInstance.get<unknown[]>(
                    deviceManagementUrl,
                    this.config
                );

                return response.data.map((device) => plainToClass(Device, device));
            },
            get: async (code: string): Promise<Device> => {
                const url = `${deviceManagementUrl}/${code}`;

                const response = await this.axiosInstance.get<unknown>(url, this.config);

                return plainToClass(Device, response.data);
            },
            submit: async (
                code: string,
                { notes, fileIds }: { notes?: string; fileIds?: string[] } = {}
            ): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/submit`;

                await this.axiosInstance.put<unknown>(
                    url,
                    { notes, file_data: fileIds?.map((id: string) => ({ file_uid: id })) ?? [] },
                    this.config
                );
            },
            verify: async (
                code: string,
                { notes, fileIds }: { notes?: string; fileIds?: string[] } = {}
            ): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/verify`;

                await this.axiosInstance.put<unknown>(
                    url,
                    { notes, file_data: fileIds?.map((id: string) => ({ file_uid: id })) ?? [] },
                    this.config
                );
            },
            approve: async (
                code: string,
                { notes, fileIds }: { notes?: string; fileIds?: string[] } = {}
            ): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/approve`;

                await this.axiosInstance.put<unknown>(
                    url,
                    { notes, file_data: fileIds?.map((id: string) => ({ file_uid: id })) ?? [] },
                    this.config
                );
            },
            refer: async (
                code: string,
                { notes, fileIds }: { notes?: string; fileIds?: string[] } = {}
            ): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/refer`;

                await this.axiosInstance.put<unknown>(
                    url,
                    { notes, file_data: fileIds?.map((id: string) => ({ file_uid: id })) ?? [] },
                    this.config
                );
            },
            reject: async (
                code: string,
                { notes, fileIds }: { notes?: string; fileIds?: string[] } = {}
            ): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/reject`;

                await this.axiosInstance.put<unknown>(
                    url,
                    { notes, file_data: fileIds?.map((id: string) => ({ file_uid: id })) ?? [] },
                    this.config
                );
            },
            withdraw: async (code: string, { notes }: { notes?: string } = {}): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/withdraw`;

                await this.axiosInstance.put<unknown>(url, { notes }, this.config);
            }
        };
    }

    public get fuel() {
        const fuelUrl = `${this.endPointUrl}/api/irec/v1/fuels`;

        return {
            getFuelTypes: async (): Promise<FuelType[]> => {
                const url = `${fuelUrl}/fuel`;
                const response = await this.axiosInstance.get<unknown[]>(url, this.config);

                return response.data.map((fuel) => plainToClass(FuelType, fuel));
            },
            getDeviceTypes: async (): Promise<DeviceType[]> => {
                const url = `${fuelUrl}/type`;
                const response = await this.axiosInstance.get<unknown[]>(url, this.config);

                return response.data.map((fuelType) => plainToClass(DeviceType, fuelType));
            }
        };
    }

    public async transfer(transfer: Transfer): Promise<TransactionResult> {
        const t = transfer instanceof Transfer ? transfer : plainToClass(Transfer, transfer);

        await validateOrReject(t);

        const url = `${this.endPointUrl}/api/irec/v1/transfer-management`;

        const response = await this.axiosInstance.post<{ transaction: any }>(
            url,
            classToPlain(t),
            this.config
        );

        return plainToClass(TransactionResult, response.data.transaction);
    }

    public async redeem(redemption: Redemption): Promise<RedeemTransactionResult> {
        const r =
            redemption instanceof Redemption ? redemption : plainToClass(Redemption, redemption);

        await validateOrReject(redemption);

        const url = `${this.endPointUrl}/api/irec/v1/redemption-management`;

        const response = await this.axiosInstance.post<{ transaction: any }>(
            url,
            classToPlain(r),
            this.config
        );

        return plainToClass(RedeemTransactionResult, response.data.transaction);
    }

    private applyTokens(accessToken: string, refreshToken: string, expiresIn: number) {
        this.accessTokens = {
            expiryDate: new Date(new Date().getTime() + expiresIn * 1000),
            accessToken,
            refreshToken
        };

        this.config = {
            headers: {
                Authorization: `Bearer ${this.accessTokens.accessToken}`
            }
        };
    }

    private async refreshAccessTokens() {
        const url = `${this.endPointUrl}/api/token`;

        this.disableInterceptor();
        const response = await this.axiosInstance.post<{
            expires_in: number;
            access_token: string;
            refresh_token: string;
        }>(
            url,
            qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: this.accessTokens.refreshToken
            })
        );
        this.enableInterceptor();

        this.applyTokens(
            response.data.access_token,
            response.data.refresh_token,
            response.data.expires_in
        );
        this.emit('tokensRefreshed', this.accessTokens);

        return this.accessTokens;
    }

    private async ensureNotExpired() {
        if (!this.accessTokens) {
            throw new Error('Access token was not set');
        }
        if (this.accessTokens.expiryDate <= new Date() && this.accessTokens.refreshToken) {
            await this.refreshAccessTokens();
        }
    }

    private enableInterceptor() {
        if (!Number.isNaN(this.interceptorId)) {
            return;
        }

        this.interceptorId = this.axiosInstance.interceptors.request.use(async (config) => {
            console.log(`${config.method} ${config.url} ${JSON.stringify(config.data) ?? ''}`);
            await this.ensureNotExpired();

            return config;
        });
    }

    private disableInterceptor() {
        if (Number.isNaN(this.interceptorId)) {
            return;
        }

        this.axiosInstance.interceptors.request.eject(this.interceptorId);
        this.interceptorId = NaN;
    }

    private enableErrorHandler() {
        this.axiosInstance.interceptors.response.use(
            (res) => res,
            (err) => {
                return Promise.reject(
                    new Error(
                        JSON.stringify({
                            status: err?.response?.data?.status ?? err?.response?.status ?? 500,
                            msg:
                                err?.response?.data?.msg ??
                                err?.response?.data?.title ??
                                err.message
                        })
                    )
                );
            }
        );
    }
}
