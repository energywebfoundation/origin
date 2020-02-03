import * as Configuration from './Configuration';
import { PreciseProofs } from 'precise-proofs-js';
import { validateJson } from '../off-chain-data/json-validator';
import { IPreciseProof } from '@energyweb/origin-backend-client';

export interface IOffChainProperties {
    rootHash: string;
    salts: string[];
    schema: string[];
}

export interface IOnChainProperties {
    propertiesDocumentHash: string;
    url: string;
}

export abstract class Entity implements IOnChainProperties {
    id: string;
    configuration: Configuration.Entity;
    proofs: PreciseProofs.Proof[];

    propertiesDocumentHash: string;
    url: string;
    
    constructor(id: string, configuration: Configuration.Entity) {
        if (typeof id !== 'string' && id !== null) {
            throw new Error('An ID of an Entity should always be of type string.');
        }
        if (isNaN(Number(id))) {
            throw new Error('An ID of an Entity should always be numeric string.');
        }
        if (!configuration.offChainDataSource) {
            throw new Error('Entity::constructor: Please set offChainDataSource in the configuration.');
        }

        this.id = id;
        this.configuration = configuration;
        this.proofs = [];
    }

    get offChainDataClient() {
        return this.configuration.offChainDataSource.preciseProofClient;
    };

    addProof(proof: PreciseProofs.Proof) {
        this.proofs.push(proof);
    }

    get baseUrl(): string {
        return `${this.configuration.offChainDataSource.dataApiUrl}/Entity`;
    }

    get fullUrl(): string {
        return `${this.baseUrl}/${this.propertiesDocumentHash}`;
    }

    prepareEntityCreation(offChainProperties: any, schema: any): IOffChainProperties {
        validateJson(offChainProperties, schema, this.baseUrl, this.configuration.logger);

        return this.generateAndAddProofs(offChainProperties);
    }

    async syncOffChainStorage<T>(properties: T, offChainStorageProperties: IOffChainProperties): Promise<void> {
        const newLocation = `${this.baseUrl}/${offChainStorageProperties.rootHash}`;

        const hasSynced = await this.offChainDataClient.insert(newLocation, {
            properties,
            salts: offChainStorageProperties.salts,
            schema: offChainStorageProperties.schema
        });

        if (!hasSynced) {
            throw new Error('createDevice: Saving off-chain data failed.');
        }

        this.propertiesDocumentHash = offChainStorageProperties.rootHash;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`Put off chain properties to ${this.id}/${this.propertiesDocumentHash}`);
        }
    }

    async deleteFromOffChainStorage() {
        await this.offChainDataClient.delete(this.fullUrl);

        if (this.configuration.logger) {
            this.configuration.logger.verbose(
                `Deleted off chain properties of ${this.id}/${this.propertiesDocumentHash}`
            );
        }
    }

    async getOffChainProperties<T>(): Promise<T> {
        const { properties, salts, schema } = await this.offChainDataClient.get<T>(this.fullUrl);

        this.generateAndAddProofs(properties, salts);
        this.verifyOffChainProperties(this.propertiesDocumentHash, properties, schema);

        if (this.configuration.logger) {
            this.configuration.logger.verbose(
                `Got off chain properties from ${this.id}/${this.propertiesDocumentHash}`
            );
        }

        return properties;
    }

    async getOffChainDump<T>(): Promise<IPreciseProof<T>> {
        return this.offChainDataClient.get<T>(this.fullUrl);
    }

    // Throws an error if it doesn' exist
    async throwIfExists(): Promise<void> {
        try {
            await this.offChainDataClient.get(this.fullUrl);
            throw new Error('Entity: Already exists.');
        } catch (e) {
            return;
        }
    }

    verifyOffChainProperties(rootHash: string, properties: any, schema: string[]) {
        Object.keys(properties).map(key => {
            const theProof = this.proofs.find((proof: PreciseProofs.Proof) => proof.key === key);

            if (this.configuration.logger.level == 'debug') {
                console.log('\nDEBUG verifyOffChainProperties');
                console.log('rootHash: ' + rootHash);
                console.log('properties: ' + properties);
            }

            if (theProof) {
                if (!PreciseProofs.verifyProof(rootHash, theProof, schema)) {
                    throw new Error(
                        `Proof ${JSON.stringify(theProof)} for property ${key} is invalid.`
                    );
                }
            } else {
                throw new Error(`Could not find proof for property ${key}`);
            }
        });
    }

    abstract async sync(): Promise<Entity>;

    protected generateAndAddProofs(properties: any, salts?: string[]): IOffChainProperties {
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

        if (this.configuration.logger.level == 'debug') {
            console.log('\nDEBUG generateAndAddProofs');
            console.log(result);
            PreciseProofs.printTree(merkleTree, leafs, schema);
        }

        return result;
    }
}
