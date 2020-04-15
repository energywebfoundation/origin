import { bigNumberify } from 'ethers/utils';
import {
    CertificationRequestOffChainData,
    CertificationRequestUpdateData,
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx
} from '@energyweb/origin-backend-core';

import { IRequestClient, RequestClient } from './RequestClient';

export class CertificationRequestDTO {
    id: number;
    energy: string;
    files: string[];
}

export interface ICertificateClient {
    updateCertificationRequestData(
        id: number,
        data: CertificationRequestUpdateData
    ): Promise<boolean>;
    getCertificationRequestData(id: number): Promise<CertificationRequestOffChainData>;
    getOwnershipCommitment(certificateId: number): Promise<IOwnershipCommitmentProofWithTx>;
    getPendingOwnershipCommitment(certificateId: number): Promise<IOwnershipCommitmentProofWithTx>;
    addOwnershipCommitment(
        certificateId: number,
        data: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus>;
    approvePendingOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx>;
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
        const dto: CertificationRequestDTO = {
            id,
            energy: data.energy.toString(),
            files: data.files
        };

        const response = await this.requestClient.post<CertificationRequestDTO, boolean>(
            `${this.certificateRequestEndpoint}/${id}`,
            dto
        );

        const success = response.status >= 200 && response.status < 300;

        if (!success) {
            console.error(`Unable to create certification request ${id}`);
            console.error(JSON.stringify(response));
        }

        return success;
    }

    public async getCertificationRequestData(
        id: number
    ): Promise<CertificationRequestOffChainData> {
        const { data } = await this.requestClient.get<void, CertificationRequestDTO>(
            `${this.certificateRequestEndpoint}/${id}`
        );

        return {
            ...data,
            energy: bigNumberify(data.energy)
        };
    }

    public async getOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async getPendingOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment/pending`;
        const { data } = await this.requestClient.get(url);

        return data;
    }

    public async addOwnershipCommitment(
        certificateId: number,
        proof: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus> {
        const request = await this.requestClient.post<
            IOwnershipCommitmentProofWithTx,
            CommitmentStatus
        >(`${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`, proof);

        return request.data;
    }

    public async approvePendingOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const response = await this.requestClient.put<
            IOwnershipCommitmentProofWithTx,
            IOwnershipCommitmentProofWithTx
        >(`${this.certificateEndpoint}/${certificateId}/OwnershipCommitment/pending/approve`);

        return response.data;
    }
}
