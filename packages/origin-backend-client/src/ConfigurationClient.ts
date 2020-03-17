import { IOriginConfiguration } from '@energyweb/origin-backend-core';
import { IRequestClient, RequestClient } from './RequestClient';

export interface IConfigurationClient {
    get(): Promise<IOriginConfiguration>;
    update(configuration: IOriginConfiguration): Promise<boolean>;
}

export class ConfigurationClient implements IConfigurationClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async get(): Promise<IOriginConfiguration> {
        const url = `${this.dataApiUrl}/Configuration`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async update(configuration: IOriginConfiguration): Promise<boolean> {
        const { status } = await this.requestClient.put(
            `${this.dataApiUrl}/Configuration`,
            configuration
        );

        return status >= 200 && status < 300;
    }
}
