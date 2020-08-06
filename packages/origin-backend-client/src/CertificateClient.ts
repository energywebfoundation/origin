import {
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx,
    IRequestClient,
    ICertificateClient
} from '@energyweb/origin-backend-core';

import { RequestClient } from './RequestClient';

export class CertificateClient implements ICertificateClient {
    constructor(
        private readonly dataApiUrl: string,
        private readonly requestClient: IRequestClient = new RequestClient()
    ) {}

    private get certificateEndpoint() {
        return `${this.dataApiUrl}/Certificate`;
    }

    public async getOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const url = `${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`;
        const { data } = await this.requestClient.get<unknown, IOwnershipCommitmentProofWithTx>(
            url
        );

        return data;
    }

    public async addOwnershipCommitment(
        certificateId: number,
        proof: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus> {
        const request = await this.requestClient.put<
            IOwnershipCommitmentProofWithTx,
            CommitmentStatus
        >(`${this.certificateEndpoint}/${certificateId}/OwnershipCommitment`, proof);

        return request.data;
    }
}
