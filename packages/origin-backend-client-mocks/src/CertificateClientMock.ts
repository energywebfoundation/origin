import {
    ICertificateOwnership,
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx,
    ICertificateClient
} from '@energyweb/origin-backend-core';

export class CertificateClientMock implements ICertificateClient {
    private certificateStorage = new Map<number, ICertificateOwnership>();

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
                originalRequestor: '',
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
