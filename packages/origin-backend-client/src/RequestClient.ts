import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';

export interface IRequestClient {
    authenticationToken: string;

    get<T, U>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<U>>;

    post<T, U>(url: string, data?: T, config?: AxiosRequestConfig): Promise<AxiosResponse<U>>;

    put<T, U>(url: string, data?: T, config?: AxiosRequestConfig): Promise<AxiosResponse<U>>;

    delete<T, U>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<U>>;

    generateCancelToken(): CancelTokenSource;
}

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

    private get config(): AxiosRequestConfig {
        const config: AxiosRequestConfig = {};

        if (this.authenticationToken) {
            config.headers = {
                Authorization: `Bearer ${this.authenticationToken}`
            };
        }

        return config;
    }
}
