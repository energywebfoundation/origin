import { IRequestClient, RequestClient } from './RequestClient';

export interface IOffChainData<T> {
    salts: string[];
    schema: string[];
    properties?: T;
    rootHash?: string;
}

export interface IOffChainDataClient {
    get<T>(path: string): Promise<IOffChainData<T>>;
    delete(path: string): Promise<boolean>;
    insert<T>(path: string, entity: IOffChainData<T>): Promise<boolean>;
}

export class OffChainDataClient implements IOffChainDataClient {
    constructor(private readonly requestClient: IRequestClient = new RequestClient()) {}

    public async get<T>(url: string): Promise<IOffChainData<T>> {
        const result = await this.requestClient.get(this.normalizeURL(url));

        return result.data as IOffChainData<T>;
    }

    public async delete(url: string): Promise<boolean> {
        const result = await this.requestClient.delete(this.normalizeURL(url));

        return result.status === 200;
    }

    public async insert<T>(url: string, offChainData: IOffChainData<T>): Promise<boolean> {
        const normalizedURL = this.normalizeURL(url);
        const result = await this.requestClient.post(normalizedURL, offChainData);

        return result.status >= 200 && result.status < 300;
    }

    private normalizeURL(url: string): string {
        return url.toLocaleLowerCase();
    }
}
