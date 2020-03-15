import {
    CertificationRequestOffChainData,
    CertificationRequestUpdateData
} from '@energyweb/origin-backend-core';

import { ICertificateClient } from '@energyweb/origin-backend-client';

export class CertificateClientMock implements ICertificateClient {
    private requestStorage = new Map<string, CertificationRequestOffChainData>();

    public async updateCertificationRequestData(
        id: string,
        data: CertificationRequestUpdateData
    ): Promise<boolean> {
        this.requestStorage.set(id, {
            id,
            energy: data.energy,
            files: data.files
        });

        return true;
    }

    public async getCertificationRequestData(
        id: string
    ): Promise<CertificationRequestOffChainData> {
        return this.requestStorage.get(id);
    }
}
