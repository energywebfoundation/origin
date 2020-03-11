import { IRequestClient, RequestClient } from './RequestClient';

export type ConfigurationItem =
    | 'ContractsLookup'
    | 'Currency'
    | 'Compliance'
    | 'Country'
    | 'device-types';

export interface IConfigurationClient {
    get(item: ConfigurationItem): Promise<any>;
    add(item: ConfigurationItem, value: string | object): Promise<boolean>;
}

export class ConfigurationClient implements IConfigurationClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async get(item: ConfigurationItem) {
        const url = `${this.dataApiUrl}/${item}`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async add(item: ConfigurationItem, value: string | object) {
        const url = `${this.dataApiUrl}/${item}`;
        const { status } = await this.requestClient.post(url, { value });

        return status >= 200 && status < 300;
    }
}
