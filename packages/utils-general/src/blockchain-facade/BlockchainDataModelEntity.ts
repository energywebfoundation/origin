import * as Configuration from './Configuration';
import { PreciseProofs } from 'ew-utils-general-precise-proofs';
import axios from 'axios';
import { validateJson } from '../off-chain-data/json-validator';

export interface IOffChainProperties {
    rootHash: string;
    salts: string[];
    schema: string[];
}

export interface IOnChainProperties {
    propertiesDocumentHash: string;
    url: string;
}

export abstract class Entity {
    id: string;
    configuration: Configuration.Entity;
    proofs: PreciseProofs.Proof[];

    constructor(id: string, configuration: Configuration.Entity) {
        if (typeof id !== 'string' && id !== null) {
            throw Error('An ID of an Entity should always be of type string.');
        }
        if (isNaN(Number(id))) {
            throw Error('An ID of an Entity should always be numeric string.');
        }

        this.id = id;
        this.configuration = configuration;
        this.proofs = [];
    }

    addProof(proof: PreciseProofs.Proof) {
        this.proofs.push(proof);
    }

    abstract getUrl(): string;

    prepareEntityCreation(
        offChainProperties: any,
        schema: any,
        url?: string,
        debug?: boolean
    ): IOffChainProperties {
        if (!this.configuration.offChainDataSource) {
            return null;
        }
        const storageUrl = url || this.getUrl();

        validateJson(offChainProperties, schema, storageUrl, this.configuration.logger);
        
        return this.generateAndAddProofs(offChainProperties, debug);
    }

    async syncOffChainStorage(
        properties: any,
        offChainStorageProperties: IOffChainProperties,
        url?: string
    ) {
        if (this.configuration.offChainDataSource) {
            const storageUrl = url || this.getUrl();
            const entityUrl = `${storageUrl}/${String(this.id).toLowerCase()}`;

            let postOrPut;

            try {
                await axios.get(entityUrl);
    
                postOrPut = axios.put;
            } catch (error) {
                if (error.response.status !== 404) {
                    throw error;
                }

                postOrPut = axios.post;
            }

            await postOrPut(entityUrl, {
                properties,
                salts: offChainStorageProperties.salts,
                schema: offChainStorageProperties.schema
            });

            if (this.configuration.logger) {
                this.configuration.logger.verbose(
                    `Put off chain properties to ${storageUrl}/${this.id}`
                );
            }
        }
    }

    async deleteFromOffChainStorage(url?: string) {
        if (this.configuration.offChainDataSource) {
            const storageUrl = url || this.getUrl();

            await axios.delete(`${storageUrl}/${this.id}`);

            if (this.configuration.logger) {
                this.configuration.logger.verbose(
                    `Deleted off chain properties of ${storageUrl}/${this.id}`
                );
            }
        }
    }

    async getOffChainProperties(hash: string, url?: string, debug?: boolean): Promise<any> {
        if (this.configuration.offChainDataSource) {
            const storageUrl = url || this.getUrl();
            const data = (await axios.get(`${storageUrl}/${String(this.id).toLowerCase()}`)).data;
            const offChainProperties = data.properties;
            this.generateAndAddProofs(data.properties, debug, data.salts);

            this.verifyOffChainProperties(hash, offChainProperties, data.schema, debug);
            if (this.configuration.logger) {
                this.configuration.logger.verbose(
                    `Got off chain properties from ${storageUrl}/${this.id}`
                );
            }

            return offChainProperties;
        }

        return null;
    }

    verifyOffChainProperties(rootHash: string, properties: any, schema: string[], debug: boolean) {
        Object.keys(properties).map(key => {
            const theProof = this.proofs.find((proof: PreciseProofs.Proof) => proof.key === key);

            if (debug) {
                console.log('\nDEBUG verifyOffChainProperties');
                console.log('rootHash: ' + rootHash);
                console.log('properties: ' + properties);
            }

            if (theProof) {
                if (!PreciseProofs.verifyProof(rootHash, theProof, schema)) {
                    throw new Error(`Proof ${JSON.stringify(theProof)} for property ${key} is invalid.`);
                }
            } else {
                throw new Error(`Could not find proof for property ${key}`);
            }
        });
    }

    abstract async sync(): Promise<Entity>;

    protected generateAndAddProofs(
        properties: any,
        debug: boolean,
        salts?: string[]
    ): IOffChainProperties {
        this.proofs = [];
        let leafs = salts
            ? PreciseProofs.createLeafs(properties, salts)
            : PreciseProofs.createLeafs(properties);

        leafs = PreciseProofs.sortLeafsByKey(leafs);

        const merkleTree = PreciseProofs.createMerkleTree(
            leafs.map((leaf: PreciseProofs.Leaf) => leaf.hash)
        );

        leafs.forEach((leaf: PreciseProofs.Leaf) =>
            this.addProof(PreciseProofs.createProof(leaf.key, leafs, true, merkleTree))
        );

        const schema = leafs.map((leaf: PreciseProofs.Leaf) => leaf.key);

        const result = {
            rootHash: PreciseProofs.createExtendedTreeRootHash(
                merkleTree[merkleTree.length - 1][0],
                schema
            ),
            salts: leafs.map((leaf: PreciseProofs.Leaf) => leaf.salt),
            schema
        };

        if (debug) {
            console.log('\nDEBUG generateAndAddProofs');
            console.log(result);
            PreciseProofs.printTree(merkleTree, leafs, schema);
        }

        return result;
    }
}
