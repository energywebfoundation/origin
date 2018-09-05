import { Configuration } from './Configuration';
import { PreciseProofs } from 'precise-proofs';
import axios from 'axios';
import { validateJson } from '../utils/JsonValidation';

export interface OffChainStorageProperties {
    rootHash: string;
    salts: string[];
    schema: string[];
}

export interface OnChainProperties {
    propertiesDocumentHash: string;
    url: string;
}

export abstract class BlockchainDataModelEntity {

    id: string;
    configuration: Configuration;
    proofs: PreciseProofs.Proof[];

    constructor(id: string, configuration: Configuration) {
        this.id = id;
        this.configuration = configuration;
        this.proofs = [];
    }

    addProof(proof: PreciseProofs.Proof) {
        this.proofs.push(proof);
    }

    getUrl(): string {
        return `${this.configuration.offChainDataSource.baseUrl}/${this.constructor.name}`;
    }

    prepareEntityCreation(onChainProperties: OnChainProperties, offChainProperties: any, schema: any): OffChainStorageProperties {
        validateJson(offChainProperties, schema, this.getUrl(), this.configuration.logger);

        if (this.configuration.offChainDataSource) {
            if (onChainProperties.url) {
                throw new Error('URL should not be set');
            }
            if (onChainProperties.propertiesDocumentHash) {
                throw new Error('Hash should not be set');
            }

            return this.generateAndAddProofs(offChainProperties);
        }
        return null;
    }

    async putToOffChainStorage(properties: any, offChainStorageProperties: OffChainStorageProperties) {

        if (this.configuration.offChainDataSource) {
            await axios.put(`${this.getUrl()}/${this.id}`, {
                properties,
                salts: offChainStorageProperties.salts,
                schema: offChainStorageProperties.schema,
            });
            this.configuration.logger.verbose(`Put off chain properties to ${this.getUrl()}/${this.id}`);
        }
    }

    async getOffChainProperties(hash: string): Promise<any> {
        if (this.configuration.offChainDataSource) {
            const data = (await axios.get(`${this.getUrl()}/${this.id}`)).data;
            const offChainProperties = data.properties;
            this.generateAndAddProofs(data.properties, data.salts);

            this.verifyOffChainProperties(hash, offChainProperties, data.schema);
            this.configuration.logger.verbose(`Got off chain properties from ${this.getUrl()}/${this.id}`);
            return offChainProperties;

        }
        return null;
    }

    verifyOffChainProperties(rootHash: string, properties: any, schema: string[]) {

        Object.keys(properties).map((key) => {

            const proof = this.proofs.find((proof: PreciseProofs.Proof) => proof.key === key);

            if (proof) {
                if (!PreciseProofs.verifyProof(rootHash, proof, schema)) {
                    throw new Error(`Proof for property ${key} is invalid.`);

                }
            } else {
                throw new Error(`Could not find proof for property ${key}`);

            }

        });

    }

    abstract async sync(): Promise<BlockchainDataModelEntity>;

    protected generateAndAddProofs(properties: any, salts?: string[]): OffChainStorageProperties {
        this.proofs = [];
        let leafs;
        if (salts) {
            leafs = PreciseProofs.createLeafs(properties, salts);
        } else {
            leafs = PreciseProofs.createLeafs(properties);
        }

        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash));
        leafs.forEach((leaf: PreciseProofs.Leaf) =>
            this.addProof(PreciseProofs.createProof(leaf.key, leafs, true, merkleTree)),
        );

        const schema = leafs.map((leaf: PreciseProofs.Leaf) => leaf.key);

        return {
            rootHash: PreciseProofs.createExtendedTreeRootHash(merkleTree[merkleTree.length - 1][0], schema),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            schema,
        };

    }

}