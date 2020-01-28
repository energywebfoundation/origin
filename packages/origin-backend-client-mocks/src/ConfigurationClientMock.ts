import { IConfigurationClient, ConfigurationItem } from '@energyweb/origin-backend-client';

export class ConfigurationClientMock implements IConfigurationClient {
    private storage = new Map<string, any>();

    constructor(private readonly baseUrl: string) {}

    public async get(item: ConfigurationItem) {
        const url = `${this.baseUrl}/${item}`;

        return this.storage.get(url);
    }

    public async add(item: ConfigurationItem, value: string | object) {
        const url = `${this.baseUrl}/${item}`;

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
