import * as Configuration from './Configuration';
import { PreciseProofs } from 'precise-proofs';
import axios from 'axios';
import { validateJson } from '../off-chain-data/json-validator';

export interface OffChainProperties {
    rootHash: string;
    salts: string[];
    schema: string[];
}

export interface OnChainProperties {
    propertiesDocumentHash: string;
    url: string;
}

export abstract class Entity {

    id: string;
    configuration: Configuration.Entity;
    proofs: PreciseProofs.Proof[];

    constructor(id: string, configuration: Configuration.Entity) {
        this.id = id;
        this.configuration = configuration;
        this.proofs = [];
    }

    addProof(proof: PreciseProofs.Proof) {
        this.proofs.push(proof);
    }

    abstract getUrl(): string;

    prepareEntityCreation(onChainProperties: OnChainProperties, offChainProperties: any, schema: any, debug: boolean): OffChainProperties {
        validateJson(offChainProperties, schema, this.getUrl(), this.configuration.logger);

        if (this.configuration.offChainDataSource) {
            if (onChainProperties.url) {
                throw new Error('URL should not be set');
            }
            if (onChainProperties.propertiesDocumentHash) {
                throw new Error('Hash should not be set');
            }

            return this.generateAndAddProofs(offChainProperties, debug);
        }
        return null;
    }

    async putToOffChainStorage(properties: any, offChainStorageProperties: OffChainProperties) {

        if (this.configuration.offChainDataSource) {
            await axios.put(`${this.getUrl()}/${this.id}`, {
                properties,
                salts: offChainStorageProperties.salts,
                schema: offChainStorageProperties.schema,
            });
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Put off chain properties to ${this.getUrl()}/${this.id}`);
            }
        }
    }

    async getOffChainProperties(hash: string, debug?: boolean): Promise<any> {
        if (this.configuration.offChainDataSource) {
            const data = (await axios.get(`${this.getUrl()}/${this.id}`)).data;
            const offChainProperties = data.properties;
            this.generateAndAddProofs(data.properties, data.salts);

            this.verifyOffChainProperties(hash, offChainProperties, data.schema, debug);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`Got off chain properties from ${this.getUrl()}/${this.id}`);
            }
            return offChainProperties;

        }
        return null;
    }

    verifyOffChainProperties(rootHash: string, properties: any, schema: string[], debug: boolean) {

        Object.keys(properties).map((key) => {

            const theProof = this.proofs.find((proof: PreciseProofs.Proof) => proof.key === key);

            if (debug) {
                console.log('\nDEBUG');

            }

            if (theProof) {
                if (!PreciseProofs.verifyProof(rootHash, theProof, schema)) {
                    throw new Error(`Proof for property ${key} is invalid.`);

                }
            } else {
                throw new Error(`Could not find proof for property ${key}`);

            }

        });

    }

    abstract async sync(): Promise<Entity>;

    protected generateAndAddProofs(properties: any, debug: boolean, salts?: string[]): OffChainProperties {
        this.proofs = [];
        let leafs = salts ? PreciseProofs.createLeafs(properties, salts) : 
            PreciseProofs.createLeafs(properties);
       
        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash));
        
        leafs.forEach((leaf: PreciseProofs.Leaf) =>
            this.addProof(PreciseProofs.createProof(leaf.key, leafs, true, merkleTree)),
        );

        const schema = leafs.map((leaf: PreciseProofs.Leaf) => leaf.key);

        const result = {
            rootHash: PreciseProofs.createExtendedTreeRootHash(merkleTree[merkleTree.length - 1][0], schema),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            schema,
        };

        if (debug) {
            console.log('\nDEBUG');
            console.log(result);
            PreciseProofs.printTree(merkleTree, leafs, schema);
        }
        
        return result;

    }

}
