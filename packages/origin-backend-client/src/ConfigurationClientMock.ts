import { IConfigurationClient, ConfigurationItem } from './ConfigurationClient';

export class ConfigurationClientMock implements IConfigurationClient {
    private storage = new Map<string, string[]>();

    public async get(baseUrl: string, item: ConfigurationItem) {
        const url = `{baseUrl}/${item.toLowerCase()}`;

        return this.storage.get(url);
    }

    public async add(baseUrl: string, item: ConfigurationItem, value: string) {
        const url = `{baseUrl}/${item.toLowerCase()}`;
        const values = this.storage.get(url) || [];

        values.push(value);
        this.storage.set(url, values);

        return true;
    }
}
