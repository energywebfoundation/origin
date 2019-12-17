import axios from 'axios';

export type ConfigurationItem = 'MarketContractLookup' | 'Currency' | 'Compliance';

export interface IConfigurationClient {
    get(baseUrl: string, item: ConfigurationItem): Promise<string[] | string>;
    add(baseUrl: string, item: ConfigurationItem, value: string): Promise<boolean>;
}

export class ConfigurationClient implements IConfigurationClient {
    public async get(baseUrl: string, item: ConfigurationItem) {
        const url = `${baseUrl}/${item}`;
        
        const result = await axios.get(url);

        return result.data;
    }

    public async add(baseUrl: string, item: ConfigurationItem, value: string) {
        const url = `${baseUrl}/${item}`;

        const result = await axios.post(url, { value });

        return result.status >= 200 && result.status < 300;
    }
}
