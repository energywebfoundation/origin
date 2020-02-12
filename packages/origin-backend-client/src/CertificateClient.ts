import {
    ICertificationRequestWithRelationsIds,
    CertificationRequestCreateData,
    CertificationRequestUpdateData,
    CertificationRequestStatus
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export interface ICertificateClient {
    requestCertificates(
        data: CertificationRequestCreateData
    ): Promise<ICertificationRequestWithRelationsIds>;
    approveCertificationRequest(id: string): Promise<ICertificationRequestWithRelationsIds>;
    getCertificationRequest(id: string): Promise<ICertificationRequestWithRelationsIds>;
    getCertificationRequests(): Promise<ICertificationRequestWithRelationsIds[]>;
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

    public async requestCertificates(data: CertificationRequestCreateData) {
        const response = await this.requestClient.post<
            CertificationRequestCreateData,
            ICertificationRequestWithRelationsIds
        >(this.certificateRequestEndpoint, data);

        return response.data;
    }

    public async approveCertificationRequest(id: string) {
        const response = await this.requestClient.put<
            CertificationRequestUpdateData,
            ICertificationRequestWithRelationsIds
        >(`${this.certificateRequestEndpoint}/${id}`, {
            status: CertificationRequestStatus.Approved
        });

        return response.data;
    }

    public async getCertificationRequests() {
        const { data } = await this.requestClient.get<
            void,
            ICertificationRequestWithRelationsIds[]
        >(this.certificateRequestEndpoint);

        return data;
    }

    public async getCertificationRequest(id: string) {
        const { data } = await this.requestClient.get<void, ICertificationRequestWithRelationsIds>(
            `${this.certificateRequestEndpoint}/${id}`
        );

        return data;
    }
}
