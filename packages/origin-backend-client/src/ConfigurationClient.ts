import axios from 'axios';

export type ConfigurationItem = 'MarketContractLookup' | 'Currency' | 'Compliance' | 'Country';

export interface IConfigurationClient {
    get(baseUrl: string, item: ConfigurationItem): Promise<any>;
    add(baseUrl: string, item: ConfigurationItem, value: string | object): Promise<boolean>;
}

export class ConfigurationClient implements IConfigurationClient {
    public async get(baseUrl: string, item: ConfigurationItem) {
        const url = `${baseUrl}/${item}`;
        const { data } = await axios.get(url);

        return data;
    }

    public async add(baseUrl: string, item: ConfigurationItem, value: string | object) {
        const url = `${baseUrl}/${item}`;
        const { status } = await axios.post(url, { value });

        return status >= 200 && status < 300;
    }
}
