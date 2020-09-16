import { IOriginConfiguration, IConfigurationClient } from '@energyweb/origin-backend-core';

export class ConfigurationClientMock implements IConfigurationClient {
    private configuration: IOriginConfiguration = {} as IOriginConfiguration;

    public async get() {
        if (!this.configuration) {
            throw new Error('No configuration set.');
        }

        return this.configuration;
    }

    public async update(configuration: IOriginConfiguration) {
        Object.assign(this.configuration, configuration);

        return true;
    }
}
