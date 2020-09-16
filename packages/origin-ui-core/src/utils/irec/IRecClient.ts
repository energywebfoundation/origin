import { RequestClient } from '@energyweb/origin-backend-client';
import { IRequestClient } from '@energyweb/origin-backend-core';
import { Registration, RegistrationIRecPostData } from '.';

export interface IIRecClient {
    getRegistrations(): Promise<Registration[]>;
    register(registration: RegistrationIRecPostData): Promise<{ id: string }>;
    getRegistrationsById(id: number): Promise<Registration[]>;
}

export class IRecClient implements IIRecClient {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get registrationEndpoint() {
        return `${this.dataApiUrl}/irec/registration`;
    }

    public async getRegistrations(): Promise<Registration[]> {
        const response = await this.requestClient.get<unknown, Registration[]>(
            this.registrationEndpoint
        );
        return response.data;
    }

    public async getRegistrationsById(id: number): Promise<Registration[]> {
        const response = await this.requestClient.get<unknown, Registration[]>(
            `${this.registrationEndpoint}/${id}`
        );
        return response.data;
    }

    public async register(registration: RegistrationIRecPostData): Promise<{ id: string }> {
        const response = await this.requestClient.post<RegistrationIRecPostData, { id: string }>(
            this.registrationEndpoint,
            registration
        );
        return response.data;
    }
}
