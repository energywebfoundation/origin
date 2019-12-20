import { IConfigurationClient, ConfigurationItem } from './ConfigurationClient';

export class ConfigurationClientMock implements IConfigurationClient {
    private storage = new Map<string, any>();

    public async get(baseUrl: string, item: ConfigurationItem) {
        const url = `${baseUrl}/${item}`;

        return this.storage.get(url);
    }

    public async add(baseUrl: string, item: ConfigurationItem, value: string | object) {
        const url = `${baseUrl}/${item}`;

        if (typeof value === 'string') {
            const values = this.storage.get(url) || [];
            values.push(value);
            this.storage.set(url, values);
        } else if (typeof value === 'object') {
            this.storage.set(url, value);
        }

        return true;
    }
}
