import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IRequestClient } from '@energyweb/origin-backend-core';

export class RequestClient implements IRequestClient {
    public authenticationToken: string;

    async get<T, U>(url: string, config: AxiosRequestConfig = {}) {
        return axios.get<T, AxiosResponse<U>>(url, { ...this.config, ...config });
    }

    async post<T, U>(url: string, data?: T, config: AxiosRequestConfig = {}) {
        return axios.post<T, AxiosResponse<U>>(url, data, { ...this.config, ...config });
    }

    async put<T, U>(url: string, data?: T, config: AxiosRequestConfig = {}) {
        return axios.put<T, AxiosResponse<U>>(url, data, { ...this.config, ...config });
    }

    async delete<T, U>(url: string, config: AxiosRequestConfig = {}) {
        return axios.delete<T, AxiosResponse<U>>(url, { ...this.config, ...config });
    }

    generateCancelToken() {
        return axios.CancelToken.source();
    }

    public get config(): AxiosRequestConfig {
        const config: AxiosRequestConfig = {};

        if (this.authenticationToken) {
            config.headers = {
                Authorization: `Bearer ${this.authenticationToken}`
            };
        }

        return config;
    }
}
