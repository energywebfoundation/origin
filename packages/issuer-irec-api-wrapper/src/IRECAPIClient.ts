/* eslint-disable camelcase */
import 'reflect-metadata';

import axios, { AxiosRequestConfig } from 'axios';
import { classToPlain, plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import FormData from 'form-data';
import { ReadStream } from 'fs';
import qs from 'qs';

import {
    Account,
    AccountBalance,
    RedeemTransaction,
    RedeemTransactionResult,
    Transaction,
    TransactionResult,
    TransactionType
} from './Account';
import { Device, DeviceCreateUpdateParams } from './Device';
import { ApproveIssue, Issue, IssueWithStatus } from './Issue';
import { Redemption, Transfer } from './Transfer';
import { AccountItem } from './Items';
import { Fuel, FuelType } from './Fuel';

export type AccessTokens = {
    expiryDate: Date;
    accessToken: string;
    refreshToken: string;
};

export class IRECAPIClient {
    private config: AxiosRequestConfig;

    private interceptorId = NaN;

    public constructor(private readonly endPointUrl: string, private accessTokens?: AccessTokens) {
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
        const response = await axios.post<{
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
        const accountManagementUrl = `${this.endPointUrl}/api/irec/account-management`;

        return {
            getAll: async (): Promise<Account[]> => {
                const response = await axios.get<unknown[]>(accountManagementUrl, this.config);

                return response.data.map((account) => plainToClass(Account, account));
            },
            get: async (code: string): Promise<Account> => {
                const url = `${accountManagementUrl}/${code}`;

                const response = await axios.get<unknown>(url, this.config);

                return plainToClass(Account, response.data);
            },
            getBalance: async (code: string): Promise<AccountBalance[]> => {
                const url = `${accountManagementUrl}/${code}/balance`;

                const response = await axios.get<unknown[]>(url, this.config);

                return response.data.map((account) => plainToClass(AccountBalance, account));
            },
            getTransactions: async (
                code: string
            ): Promise<Array<Transaction | RedeemTransaction>> => {
                const url = `${accountManagementUrl}/${code}/transactions`;

                const response = await axios.get<any[]>(url, this.config);

                return response.data.map((transaction) => {
                    if (transaction.transaction_type.code === TransactionType.Redemption) {
                        return plainToClass(RedeemTransaction, transaction);
                    }

                    return plainToClass(Transaction, transaction);
                });
            },
            getItems: async (code: string): Promise<AccountItem[]> => {
                const url = `${accountManagementUrl}/${code}/items`;

                const response = await axios.get<unknown[]>(url, this.config);

                return response.data.map((item) => plainToClass(AccountItem, item));
            }
        };
    }

    public get issue() {
        const issueManagementUrl = `${this.endPointUrl}/api/irec/issue-management`;

        const setState = async (code: string, action: string, notes?: string) => {
            const url = `${issueManagementUrl}/${code}/${action}`;

            await axios.put(url, { notes }, this.config);
        };

        return {
            create: async (issue: Issue): Promise<string> => {
                await validateOrReject(issue);

                const url = `${issueManagementUrl}/create`;

                const response = await axios.post<{ code: string }>(
                    url,
                    classToPlain(issue),
                    this.config
                );

                return response.data.code;
            },
            update: async (code: string, issue: Issue): Promise<void> => {
                await validateOrReject(issue, { skipMissingProperties: true });

                const url = `${issueManagementUrl}/${code}/edit`;

                await axios.put(url, classToPlain(issue), this.config);
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
            approve: async (code: string, approve: ApproveIssue): Promise<void> => {
                await validateOrReject(approve);

                const url = `${issueManagementUrl}/${code}/approve`;

                await axios.put(url, classToPlain(approve), this.config);
            },
            getStatus: async (code: string): Promise<IssueWithStatus> => {
                const url = `${issueManagementUrl}/${code}`;

                const response = await axios.get<unknown>(url, this.config);

                return plainToClass(IssueWithStatus, response.data);
            }
        };
    }

    public get file() {
        const fileManagementUrl = `${this.endPointUrl}/api/irec/file-management`;

        return {
            upload: async (files: Blob[] | ReadStream[]): Promise<string[]> => {
                const url = `${fileManagementUrl}/upload`;

                const data = new FormData();
                files.forEach((file: Blob | ReadStream) => data.append('files', file));

                const headers = data.getHeaders();
                const response = await axios.post<{ file_uids: string[] }>(url, data, {
                    headers: { ...headers, ...this.config.headers }
                });

                return response.data.file_uids;
            },
            download: async (code: string): Promise<string> => {
                const url = `${fileManagementUrl}/${code}/download`;

                const response = await axios.get<{ url: string }>(url, this.config);

                return response.data.url;
            }
        };
    }

    public get device() {
        const deviceManagementUrl = `${this.endPointUrl}/api/irec/device-management`;

        return {
            create: async (device: DeviceCreateUpdateParams): Promise<void> => {
                const dev =
                    device instanceof DeviceCreateUpdateParams
                        ? device
                        : plainToClass(DeviceCreateUpdateParams, device);

                await validateOrReject(dev);

                const url = `${deviceManagementUrl}/create`;
                await axios.post(url, classToPlain(dev), this.config);
            },
            edit: async (
                code: string,
                device: Partial<DeviceCreateUpdateParams>
            ): Promise<void> => {
                const dev =
                    device instanceof DeviceCreateUpdateParams
                        ? device
                        : plainToClass(DeviceCreateUpdateParams, device);

                await validateOrReject(dev, { skipMissingProperties: true });

                const url = `${deviceManagementUrl}/${code}/edit`;

                await axios.put(url, classToPlain(dev), this.config);
            },
            getAll: async (): Promise<Device[]> => {
                const response = await axios.get<unknown[]>(deviceManagementUrl, this.config);

                return response.data.map((device) => plainToClass(Device, device));
            },
            get: async (code: string): Promise<Device> => {
                const url = `${deviceManagementUrl}/${code}`;

                const response = await axios.get<unknown>(url, this.config);

                return plainToClass(Device, response.data);
            },
            submit: async (
                code: string,
                { notes, fileIds }: { notes?: string; fileIds?: string[] } = {}
            ): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/submit`;

                await axios.put<unknown>(
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

                await axios.put<unknown>(
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

                await axios.put<unknown>(
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

                await axios.put<unknown>(
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

                await axios.put<unknown>(
                    url,
                    { notes, file_data: fileIds?.map((id: string) => ({ file_uid: id })) ?? [] },
                    this.config
                );
            },
            withdraw: async (code: string, { notes }: { notes?: string } = {}): Promise<void> => {
                const url = `${deviceManagementUrl}/${code}/withdraw`;

                await axios.put<unknown>(url, { notes }, this.config);
            }
        };
    }

    public get fuel() {
        const fuelUrl = `${this.endPointUrl}/api/irec/fuels`;

        return {
            getAll: async (): Promise<Fuel[]> => {
                const url = `${fuelUrl}/fuel`;
                const response = await axios.get<unknown[]>(url, this.config);

                return response.data.map((fuel) => plainToClass(Fuel, fuel));
            },
            getAllTypes: async (): Promise<FuelType[]> => {
                const url = `${fuelUrl}/type`;
                const response = await axios.get<unknown[]>(url, this.config);

                return response.data.map((fuelType) => plainToClass(FuelType, fuelType));
            }
        };
    }

    public async transfer(transfer: Transfer): Promise<TransactionResult> {
        await validateOrReject(transfer);

        const url = `${this.endPointUrl}/api/irec/transfer-management`;

        const response = await axios.post<{ transaction: any }>(
            url,
            classToPlain(transfer),
            this.config
        );

        return plainToClass(TransactionResult, response.data.transaction);
    }

    public async redeem(redemption: Redemption): Promise<RedeemTransactionResult> {
        await validateOrReject(redemption);

        const url = `${this.endPointUrl}/api/irec/redemption-management`;

        const response = await axios.post<{ transaction: any }>(
            url,
            classToPlain(redemption),
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
        const response = await axios.post<{
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

        this.interceptorId = axios.interceptors.request.use(async (config) => {
            console.log(`${config.method} ${config.url} ${JSON.stringify(config.data) ?? ''}`);
            await this.ensureNotExpired();

            return config;
        });
    }

    private disableInterceptor() {
        if (Number.isNaN(this.interceptorId)) {
            return;
        }

        axios.interceptors.request.eject(this.interceptorId);
        this.interceptorId = NaN;
    }

    private enableErrorHandler() {
        axios.interceptors.response.use(
            (res) => res,
            (err) =>
                Promise.reject(
                    new Error(
                        JSON.stringify({
                            status: err?.response?.data?.status ?? 500,
                            msg:
                                err?.response?.data?.msg ??
                                err?.response?.data?.title ??
                                err.message
                        })
                    )
                )
        );
    }
}
