import { OwnershipCommitmentProofWithTx } from "./OwnershipCommitment";

export enum CommitmentStatus {
    CURRENT,
    PENDING,
    REJECTED
}

export interface ICertificateOwnership {
    id: number;
    currentOwnershipCommitment: OwnershipCommitmentProofWithTx;
    pendingOwnershipCommitment: OwnershipCommitmentProofWithTx;
    ownershipHistory: OwnershipCommitmentProofWithTx[];
}