import axios from 'axios';

export interface IOffChainData<T> {
    properties: T;
    salts: string[];
    schema: string[];
}

export interface IOffChainDataClient {
    get<T>(path: string): Promise<IOffChainData<T>>;
    delete(path: string): Promise<boolean>;
    insert<T>(path: string, entity: IOffChainData<T>): Promise<boolean>;
}

export class OffChainDataClient implements IOffChainDataClient {
    public async get<T>(url: string): Promise<IOffChainData<T>> {
        const result = await axios.get(this.normalizeURL(url));

        return result.data as IOffChainData<T>;
    }

    public async delete(url: string): Promise<boolean> {
        const result = await axios.delete(this.normalizeURL(url));

        return result.status === 200;
    }

    public async insert<T>(url: string, offChainData: IOffChainData<T>): Promise<boolean> {
        const normalizedURL = this.normalizeURL(url);
        const result = await axios.post(normalizedURL, offChainData);

        return result.status >= 200 && result.status < 300;
    }

    private normalizeURL(url: string): string {
        return url.toLocaleLowerCase();
    }
}
