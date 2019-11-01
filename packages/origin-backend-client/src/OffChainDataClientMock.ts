import { IOffChainDataSourceClient, IOffChainData } from './OffChainDataClient';

export class OffChainDataClientMock implements IOffChainDataSourceClient {
    private storage = new Map<string, any>();

    private clone(input: any): any {
        return JSON.parse(JSON.stringify(input));
    }

    public async get<T>(url: string): Promise<IOffChainData<T>> {
        const result = this.storage.get(url);

        if (!result) {
            throw new Error('Entity does not exist');
        }

        return this.clone(result) as IOffChainData<T>;
    }

    public async delete(url: string): Promise<boolean> {
        return this.storage.delete(url);
    }

    public async insertOrUpdate<T>(url: string, offChainData: IOffChainData<T>): Promise<boolean> {
        this.storage.set(url, this.clone(offChainData));

        return true;
    }
}
