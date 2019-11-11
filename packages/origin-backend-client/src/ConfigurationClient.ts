import axios from 'axios';

export type ConfigurationItem = 'MarketContractLookup';

export interface IConfigurationClient {
    get(baseUrl: string, item: ConfigurationItem): Promise<string[]>;
    add(baseUrl: string, item: ConfigurationItem, value: string): Promise<boolean>;
}

export class ConfigurationClient implements IConfigurationClient {
    public async get(baseUrl: string, item: ConfigurationItem) {
        const url = `${baseUrl}/${item.toLowerCase()}`;

        const result = await axios.get(url);

        return result.data as string[];
    }

    public async add(baseUrl: string, item: ConfigurationItem, value: string) {
        const url = `${baseUrl}/${item.toLowerCase()}/${value}`;

        const result = await axios.post(url);

        return result.status === 200;
    }
}
