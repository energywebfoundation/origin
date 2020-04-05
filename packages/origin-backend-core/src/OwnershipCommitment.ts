import { PreciseProofs } from 'precise-proofs-js';

export interface IOwnershipCommitment {
    [address: string]: number;
}

export interface IOwnershipCommitmentProof {
    commitment: IOwnershipCommitment;
    rootHash: string;
    leafs: PreciseProofs.Leaf[];
    salts: string[];
}

export interface OwnershipCommitmentProofWithTx extends IOwnershipCommitmentProof {
    txHash: string;
}