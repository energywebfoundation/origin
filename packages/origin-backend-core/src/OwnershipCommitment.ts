import { PreciseProofs } from 'precise-proofs-js';
import { BigNumber } from 'ethers';

export interface IOwnershipCommitment {
    [address: string]: BigNumber;
}

export interface IOwnershipCommitmentProof {
    commitment: IOwnershipCommitment;
    rootHash: string;
    leafs: PreciseProofs.Leaf[];
    salts: string[];
}

export interface IOwnershipCommitmentProofWithTx extends IOwnershipCommitmentProof {
    txHash: string;
}
