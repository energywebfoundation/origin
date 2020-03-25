import {
    ICertificationRequestWithRelationsIds,
    CertificationRequestOffChainData,
    CertificationRequestUpdateData,
    IOwnershipCommitmentProof,
    CommitmentStatus,
    OwnershipCommitmentProofWithTx
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export interface ICertificateClient {
    updateCertificationRequestData(
        id: number,
        data: CertificationRequestUpdateData
    ): Promise<boolean>;
    getCertificationRequestData(id: number): Promise<CertificationRequestOffChainData>;
    getOwnershipCommitment(certificateId: number): Promise<OwnershipCommitmentProofWithTx>;
    getPendingOwnershipCommitment(certificateId: number): Promise<OwnershipCommitmentProofWithTx>;
    addOwnershipCommitment(certificateId: number, data: OwnershipCommitmentProofWithTx): Promise<CommitmentStatus>;
    approvePendingOwnershipCommitment(certificateId: number): Promise<OwnershipCommitmentProofWithTx>;
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

    public async updateCertificationRequestData(
        id: number,
        data: CertificationRequestUpdateData
    ): Promise<boolean> {
        const response = await this.requestClient.post<CertificationRequestUpdateData, boolean>(
            `${this.certificateRequestEndpoint}/${id}`,
            data
        );

        return response.data;
    }

    public async getCertificationRequestData(
        id: number
    ): Promise<CertificationRequestOffChainData> {
        const { data } = await this.requestClient.get<void, ICertificationRequestWithRelationsIds>(
            `${this.certificateRequestEndpoint}/${id}`
        );

        return data;
    }

    public async getOwnershipCommitment(certificateId: number): Promise<OwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async getPendingOwnershipCommitment(certificateId: number): Promise<OwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment/pending`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async addOwnershipCommitment(certificateId: number, proof: OwnershipCommitmentProofWithTx): Promise<CommitmentStatus> {
        const request = await this.requestClient.post<
            OwnershipCommitmentProofWithTx,
            CommitmentStatus
        >(`${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`, proof);

        return request.data;
    }

    public async approvePendingOwnershipCommitment(certificateId: number): Promise<OwnershipCommitmentProofWithTx> {
        const response = await this.requestClient.put<
            OwnershipCommitmentProofWithTx,
            OwnershipCommitmentProofWithTx
        >(`${this.certificateEndpoint}/${certificateId}/OwnershipCommitment/pending/approve`);

        return response.data;
    }
}
