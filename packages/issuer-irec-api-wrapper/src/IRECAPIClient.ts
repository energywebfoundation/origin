/* eslint-disable camelcase */
import 'reflect-metadata';

import axios, { AxiosRequestConfig } from 'axios';
import { classToPlain, plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import FormData from 'form-data';
import { ReadStream } from 'fs';
import qs from 'qs';

import { Account, AccountBalance, AccountTransaction } from './Account';
import { Device } from './Device';
import { ApproveIssue, Issue } from './Issue';
import { Redemption, Transfer } from './Transfer';
import { AccountItem } from './Items';

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
            getTransactions: async (code: string): Promise<AccountTransaction[]> => {
                const url = `${accountManagementUrl}/${code}/transactions`;

                const response = await axios.get<unknown[]>(url, this.config);

                return response.data.map((account) => plainToClass(AccountTransaction, account));
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
                validateOrReject(issue);

                const url = `${issueManagementUrl}/create`;

                const response = await axios.post<{ code: string }>(
                    url,
                    classToPlain(issue),
                    this.config
                );

                return response.data.code;
            },
            update: async (code: string, issue: Issue): Promise<void> => {
                validateOrReject(issue, { skipMissingProperties: true });

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
                validateOrReject(approve);

                const url = `${issueManagementUrl}/${code}/approve`;

                await axios.put(url, classToPlain(approve), this.config);
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
            create: async (device: Device): Promise<void> => {
                validateOrReject(device);

                const url = `${deviceManagementUrl}/create`;

                await axios.post(url, classToPlain(device), this.config);
            },
            update: async (code: string, device: Device): Promise<void> => {
                validateOrReject(device, { skipMissingProperties: true });

                const url = `${deviceManagementUrl}/${code}/update`;

                await axios.put(url, classToPlain(device), this.config);
            }
        };
    }

    public async transfer(transfer: Transfer): Promise<void> {
        await validateOrReject(transfer);

        const url = `${this.endPointUrl}/api/irec/transfer-management`;

        await axios.post<unknown>(url, classToPlain(transfer), this.config);
    }

    public async redeem(redemption: Redemption): Promise<void> {
        await validateOrReject(redemption);

        const url = `${this.endPointUrl}/api/irec/redemption-management`;

        await axios.post<unknown>(url, classToPlain(redemption), this.config);
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
                            status: err.response.status,
                            msg: err.response.data
                        })
                    )
                )
        );
    }
}
