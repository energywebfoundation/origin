import { Configuration } from '@energyweb/utils-general';
import { PreciseProofs } from 'precise-proofs-js';
import {
    IOwnershipCommitmentProof,
    IOwnershipCommitment,
    CommitmentStatus,
    IOwnershipCommitmentProofWithTx,
    OwnershipCommitmentStatus
} from '@energyweb/origin-backend-core';

export interface IOnChainProperties {
    propertiesDocumentHash: string;
}

export abstract class PreciseProofEntity implements IOnChainProperties {
    configuration: Configuration.Entity;

    proofs: PreciseProofs.Proof[];

    propertiesDocumentHash: string;

    constructor(public id: number, configuration: Configuration.Entity) {
        if (!configuration.offChainDataSource) {
            throw new Error(
                'Entity::constructor: Please set offChainDataSource in the configuration.'
            );
        }

        this.configuration = configuration;
        this.proofs = [];
    }

    get certificateClient() {
        return this.configuration.offChainDataSource.certificateClient;
    }

    async saveCommitment(
        proof: IOwnershipCommitmentProofWithTx
    ): Promise<OwnershipCommitmentStatus> {
        const status = await this.certificateClient.addOwnershipCommitment(this.id, proof);

        if (this.configuration.logger) {
            if (status === CommitmentStatus.REJECTED) {
                this.configuration.logger.error('Unable to save the commitment. Rejected.');
            } else if (status === CommitmentStatus.CURRENT) {
                this.configuration.logger.verbose(
                    `Commitment saved to for Certificate #${this.id}`
                );
            }
        }

        return {
            proof,
            status
        };
    }

    async getCommitment(): Promise<IOwnershipCommitmentProofWithTx> {
        const proof = await this.certificateClient.getOwnershipCommitment(this.id);

        if (!proof) {
            throw new Error('getCommitment(): Not found.');
        }

        this.generateAndAddProofs(proof.commitment, proof.salts);
        this.verifyOffChainProperties(this.propertiesDocumentHash, proof.commitment);

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Got commitment for Certificate #${this.id}`);
        }

        return proof;
    }

    verifyOffChainProperties(rootHash: string, properties: any) {
        Object.keys(properties).map((key) => {
            const theProof = this.proofs.find((proof: PreciseProofs.Proof) => proof.key === key);

            if (this.configuration.logger) {
                this.configuration.logger.debug('\nDEBUG verifyOffChainProperties');
                this.configuration.logger.debug(`rootHash: ${rootHash}`);
                this.configuration.logger.debug(`properties: ${properties}`);
            }

            if (theProof) {
                if (!PreciseProofs.verifyProof(rootHash, theProof)) {
                    throw new Error(
                        `Proof ${JSON.stringify(theProof)} for property ${key} is invalid.`
                    );
                }
            } else {
                throw new Error(`Could not find proof for property ${key}`);
            }

            return true;
        });
    }

    abstract async sync(): Promise<PreciseProofEntity>;

    generateAndAddProofs(
        commitment: IOwnershipCommitment,
        salts?: string[]
    ): IOwnershipCommitmentProof {
        this.proofs = [];
        let leafs = salts
            ? PreciseProofs.createLeafs(commitment, salts)
            : PreciseProofs.createLeafs(commitment);

        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(
            leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash)
        );

        leafs.forEach((leaf: PreciseProofs.Leaf) =>
            this.addProof(PreciseProofs.createProof(leaf.key, leafs, false))
        );

        const result = {
            commitment,
            rootHash: PreciseProofs.getRootHash(merkleTree),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            leafs
        };

        if (this.configuration.logger) {
            this.configuration.logger.debug('\nDEBUG generateAndAddProofs');
            this.configuration.logger.debug(result);
            PreciseProofs.printTree(merkleTree, leafs);
        }

        return result;
    }

    private addProof(proof: PreciseProofs.Proof) {
        this.proofs.push(proof);
    }
}
