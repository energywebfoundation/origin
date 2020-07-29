import {
    IOriginConfiguration,
    IConfigurationClient,
    IRequestClient
} from '@energyweb/origin-backend-core';
import { RequestClient } from './RequestClient';

export class ConfigurationClient implements IConfigurationClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    public async get(): Promise<IOriginConfiguration> {
        const url = `${this.dataApiUrl}/Configuration`;
        const { data } = await this.requestClient.get<unknown, IOriginConfiguration>(url);

        return data;
    }

    public async update(configuration: Partial<IOriginConfiguration>): Promise<boolean> {
        const { status } = await this.requestClient.put(
            `${this.dataApiUrl}/Configuration`,
            configuration
        );

        return status >= 200 && status < 300;
    }
}
