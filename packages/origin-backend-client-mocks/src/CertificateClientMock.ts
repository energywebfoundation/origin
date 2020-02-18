import { CertificationRequestCreateData, ICertificationRequestWithRelationsIds, CertificationRequestStatus } from '@energyweb/origin-backend-core';

import { ICertificateClient } from '@energyweb/origin-backend-client';

export class CertificateClientMock implements ICertificateClient {
    private requestStorage = new Map<string, ICertificationRequestWithRelationsIds>();

    private requestCertificateIdCounter = 0;

    public async requestCertificates(data: CertificationRequestCreateData): Promise<ICertificationRequestWithRelationsIds> {
        ++this.requestCertificateIdCounter;
        const newRequest = {
            id: this.requestCertificateIdCounter.toString(),
            ...data,
            createdDate: new Date(),
            status: CertificationRequestStatus.Pending
        };

        this.requestStorage.set(this.requestCertificateIdCounter.toString(), newRequest);

        return newRequest;
    }

    public async approveCertificationRequest(id: string): Promise<ICertificationRequestWithRelationsIds> {
        const request = this.requestStorage.get(id);
        request.status = CertificationRequestStatus.Approved;

        this.requestStorage.set(id, request);

        return request;
    }

    public async getCertificationRequests(): Promise<ICertificationRequestWithRelationsIds[]> {
        return Array.from(this.requestStorage.values());
    }

    public async getCertificationRequest(id: string): Promise<ICertificationRequestWithRelationsIds> {
        return this.requestStorage.get(id);
    }
}
