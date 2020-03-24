import { IOwnershipCommitmentProof } from "./OwnershipCommitment";

export enum CommitmentStatus {
    CURRENT,
    PENDING,
    REJECTED
}

export interface ICertificateOwnership {
    id: number;
    currentOwnershipCommitment: IOwnershipCommitmentProof;
    pendingOwnershipCommitment: IOwnershipCommitmentProof;
    ownershipHistory: IOwnershipCommitmentProof[];
}