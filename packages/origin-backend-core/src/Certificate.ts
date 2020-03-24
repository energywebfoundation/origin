import { IOwnershipCommitmentProof } from "./OwnershipCommitment";

export interface ICertificateOwnership {
    id: number;
    currentOwnershipCommitment: IOwnershipCommitmentProof;
    pendingOwnershipCommitment: IOwnershipCommitmentProof;
    ownershipHistory: IOwnershipCommitmentProof[];
}