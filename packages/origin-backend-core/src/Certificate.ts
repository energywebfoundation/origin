import { IOwnershipCommitmentProofWithTx } from './OwnershipCommitment';

export enum CommitmentStatus {
    CURRENT,
    PENDING,
    REJECTED
}

export interface IOwnershipCommitmentStatus {
    proof: IOwnershipCommitmentProofWithTx;
    status: CommitmentStatus;
}

export interface ICertificateOwnership {
    id: number;
    originalRequestor: string;
    currentOwnershipCommitment: IOwnershipCommitmentProofWithTx;
    pendingOwnershipCommitment: IOwnershipCommitmentProofWithTx;
    ownershipHistory: IOwnershipCommitmentProofWithTx[];
}
