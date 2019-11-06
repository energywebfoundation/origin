import axios from 'axios';

export interface IOffChainData<T> {
    properties: T;
    salts: string[];
    schema: string[];
}

export interface IOffChainDataClient {
    get<T>(path: string): Promise<IOffChainData<T>>;
    delete(path: string): Promise<boolean>;
    insertOrUpdate<T>(path: string, entity: IOffChainData<T>): Promise<boolean>;
}

export class OffChainDataClient implements IOffChainDataClient {
    public async get<T>(url: string): Promise<IOffChainData<T>> {
        const result = await axios.get(url);

        return result.data as IOffChainData<T>;
    }

    public async delete(url: string): Promise<boolean> {
        const result = await axios.delete(url);

        return result.status === 200;
    }

    public async insertOrUpdate<T>(url: string, offChainData: IOffChainData<T>): Promise<boolean> {
        let postOrPut;

        try {
            await axios.get(url);

            postOrPut = axios.put;
        } catch (error) {
            if (error.response.status !== 404) {
                throw error;
            }

            postOrPut = axios.post;
        }

        const result = await postOrPut(url, offChainData);
        return result.status === 200;
    }
}
