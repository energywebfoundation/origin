import {
    CertificationRequestOffChainData,
    CertificationRequestUpdateData,
    ICertificateOwnership,
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx
} from '@energyweb/origin-backend-core';

import { ICertificateClient } from '@energyweb/origin-backend-client';

export class CertificateClientMock implements ICertificateClient {
    private requestStorage = new Map<number, CertificationRequestOffChainData>();

    private certificateStorage = new Map<number, ICertificateOwnership>();

    public async updateCertificationRequestData(
        id: number,
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
        id: number
    ): Promise<CertificationRequestOffChainData> {
        return this.requestStorage.get(id);
    }

    public async getOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = this.certificateStorage.get(certificateId);

        if (!certificate?.currentOwnershipCommitment) {
            throw new Error(`getOwnershipCommitment(): doesn't exist`);
        }

        return certificate.currentOwnershipCommitment;
    }

    public async getPendingOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = this.certificateStorage.get(certificateId);

        if (!certificate?.pendingOwnershipCommitment) {
            throw new Error(`getPendingOwnershipCommitment(): doesn't exist`);
        }

        return certificate.pendingOwnershipCommitment;
    }

    public async addOwnershipCommitment(
        certificateId: number,
        proof: IOwnershipCommitmentProofWithTx
    ): Promise<CommitmentStatus> {
        const certificate = this.certificateStorage.get(certificateId);

        if (!certificate?.currentOwnershipCommitment) {
            this.certificateStorage.set(certificateId, {
                id: certificateId,
                currentOwnershipCommitment: proof,
                pendingOwnershipCommitment: null,
                ownershipHistory: []
            });

            return CommitmentStatus.CURRENT;
        }
        if (certificate.currentOwnershipCommitment && !certificate.pendingOwnershipCommitment) {
            certificate.pendingOwnershipCommitment = proof;

            this.certificateStorage.set(certificateId, certificate);
            return CommitmentStatus.PENDING;
        }

        return CommitmentStatus.REJECTED;
    }

    public async approvePendingOwnershipCommitment(
        certificateId: number
    ): Promise<IOwnershipCommitmentProofWithTx> {
        const certificate = this.certificateStorage.get(certificateId);

        if (!certificate?.pendingOwnershipCommitment) {
            throw new Error(`approvePendingOwnershipCommitment(): Doesn't exist`);
        }

        certificate.ownershipHistory.push(certificate.currentOwnershipCommitment);
        certificate.currentOwnershipCommitment = certificate.pendingOwnershipCommitment;
        certificate.pendingOwnershipCommitment = null;

        this.certificateStorage.set(certificateId, certificate);

        return certificate.currentOwnershipCommitment;
    }
}
