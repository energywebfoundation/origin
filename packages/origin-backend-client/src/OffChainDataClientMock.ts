import { IOffChainDataClient, IOffChainData } from './OffChainDataClient';

class MissingEntity extends Error {
    public response = { status: 404 };
}

export class OffChainDataClientMock implements IOffChainDataClient {
    private storage = new Map<string, any>();

    private clone(input: any): any {
        return JSON.parse(JSON.stringify(input));
    }

    public async get<T>(url: string): Promise<IOffChainData<T>> {
        const result = this.storage.get(url.toLocaleLowerCase());

        if (!result) {
            throw new MissingEntity('Entity does not exist');
        }

        return this.clone(result) as IOffChainData<T>;
    }

    public async delete(url: string): Promise<boolean> {
        return this.storage.delete(url.toLocaleLowerCase());
    }

    public async insertOrUpdate<T>(url: string, offChainData: IOffChainData<T>): Promise<boolean> {
        this.storage.set(url.toLocaleLowerCase(), this.clone(offChainData));

        return true;
    }
}
