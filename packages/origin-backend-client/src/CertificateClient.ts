import {
    ICertificationRequestWithRelationsIds,
    CertificationRequestOffChainData,
    CertificationRequestUpdateData
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export interface ICertificateClient {
    updateCertificationRequestData(id: string, data: CertificationRequestUpdateData): Promise<boolean>;
    getCertificationRequestData(id: string): Promise<CertificationRequestOffChainData>;
}

export class CertificateClient implements ICertificateClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get certificateEndpoint() {
        return `${this.dataApiUrl}/Certificate`;
    }

    private get certificateRequestEndpoint() {
        return `${this.certificateEndpoint}/CertificationRequest`;
    }

    public async updateCertificationRequestData(id: string, data: CertificationRequestUpdateData): Promise<boolean> {
        const response = await this.requestClient.post<
        CertificationRequestUpdateData,
            boolean
        >(`${this.certificateRequestEndpoint}/${id}`, data);

        return response.data;
    }

    public async getCertificationRequestData(id: string): Promise<CertificationRequestOffChainData> {
        const { data } = await this.requestClient.get<void, ICertificationRequestWithRelationsIds>(
            `${this.certificateRequestEndpoint}/${id}`
        );

        return data;
    }
}
