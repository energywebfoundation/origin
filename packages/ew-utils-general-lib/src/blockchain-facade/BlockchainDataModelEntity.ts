// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

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
    this.id = id;
    this.configuration = configuration;
    this.proofs = [];
  }

  addProof(proof: PreciseProofs.Proof) {
    this.proofs.push(proof);
  }

  abstract getUrl(): string;

  prepareEntityCreation(
    onChainProperties: IOnChainProperties,
    offChainProperties: any,
    schema: any,
    url?: string,
    debug?: boolean
  ): IOffChainProperties {
    const axiosurl = url ? url : this.getUrl();

    validateJson(
      offChainProperties,
      schema,
      axiosurl,
      this.configuration.logger
    );

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

  async putToOffChainStorage(
    properties: any,
    offChainStorageProperties: IOffChainProperties,
    url?: string
  ) {
    if (this.configuration.offChainDataSource) {
      const axiosurl = url ? url : this.getUrl();

      await axios.put(`${axiosurl}/${this.id}`, {
        properties,
        salts: offChainStorageProperties.salts,
        schema: offChainStorageProperties.schema
      });
      if (this.configuration.logger) {
        this.configuration.logger.verbose(
          `Put off chain properties to ${axiosurl}/${this.id}`
        );
      }
    }
  }

  async deleteFromOffChainStorage(url?: string) {
    if (this.configuration.offChainDataSource) {
      const axiosurl = url ? url : this.getUrl();

      await axios.delete(`${axiosurl}/${this.id}`);
      
      if (this.configuration.logger) {
        this.configuration.logger.verbose(
          `Deleted off chain properties of ${axiosurl}/${this.id}`
        );
      }
    }
  }

  async getOffChainProperties(
    hash: string,
    url?: string,
    debug?: boolean
  ): Promise<any> {
    if (this.configuration.offChainDataSource) {
      const axiosurl = url ? url : this.getUrl();
      const data = (await axios.get(`${axiosurl}/${this.id}`)).data;
      const offChainProperties = data.properties;
      this.generateAndAddProofs(data.properties, debug, data.salts);

      this.verifyOffChainProperties(
        hash,
        offChainProperties,
        data.schema,
        debug
      );
      if (this.configuration.logger) {
        this.configuration.logger.verbose(
          `Got off chain properties from ${axiosurl}/${this.id}`
        );
      }

      return offChainProperties;
    }

    return null;
  }

  verifyOffChainProperties(
    rootHash: string,
    properties: any,
    schema: string[],
    debug: boolean
  ) {
    Object.keys(properties).map(key => {
      const theProof = this.proofs.find(
        (proof: PreciseProofs.Proof) => proof.key === key
      );

      if (debug) {
        console.log('\nDEBUG verifyOffChainProperties');
        console.log('rootHash: ' + rootHash);
        console.log('properties: ' + properties);
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
      this.addProof(
        PreciseProofs.createProof(leaf.key, leafs, true, merkleTree)
      )
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
