import { PreciseProofs } from 'precise-proofs-js';

export class PreciseProofUtils {
    static generateProofs(
        commitment: IOwnershipCommitment,
        salts?: string[]
    ): IOwnershipCommitmentProof {
        let leafs = salts
            ? PreciseProofs.createLeafs(commitment, salts)
            : PreciseProofs.createLeafs(commitment);

        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(
            leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash)
        );

        return {
            commitment,
            rootHash: PreciseProofs.getRootHash(merkleTree),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            leafs
        };
    }
}

export interface IOwnershipCommitment {
    [address: string]: string;
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
