import { IConfigurationClient, ConfigurationItem } from '@energyweb/origin-backend-client';

export class ConfigurationClientMock implements IConfigurationClient {
    private storage = new Map<string, any>();

    public async get(item: ConfigurationItem) {
        return this.storage.get(item);
    }

    public async add(item: ConfigurationItem, value: string | object) {
        if (typeof value === 'string') {
            const values = this.storage.get(item) || [];
            values.push(value);
            this.storage.set(item, values);
        } else if (typeof value === 'object') {
            this.storage.set(item, value);
        }

        return true;
    }
}
