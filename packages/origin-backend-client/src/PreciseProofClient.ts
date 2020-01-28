import { IRequestClient, RequestClient } from './RequestClient';

export interface IPreciseProof<T> {
    salts: string[];
    schema: string[];
    properties?: T;
    rootHash?: string;
}

export interface IPreciseProofClient {
    get<T>(path: string): Promise<IPreciseProof<T>>;
    delete(path: string): Promise<boolean>;
    insert<T>(path: string, entity: IPreciseProof<T>): Promise<boolean>;
}

export class PreciseProofClient implements IPreciseProofClient {
    constructor(private readonly requestClient: IRequestClient = new RequestClient()) {}

    public async get<T>(url: string): Promise<IPreciseProof<T>> {
        const result = await this.requestClient.get(this.normalizeURL(url));

        return result.data as IPreciseProof<T>;
    }

    public async delete(url: string): Promise<boolean> {
        const result = await this.requestClient.delete(this.normalizeURL(url));

        return result.status === 200;
    }

    public async insert<T>(url: string, PreciseProof: IPreciseProof<T>): Promise<boolean> {
        const normalizedURL = this.normalizeURL(url);
        const result = await this.requestClient.post(normalizedURL, PreciseProof);

        return result.status >= 200 && result.status < 300;
    }

    private normalizeURL(url: string): string {
        return url.toLocaleLowerCase();
    }
}
