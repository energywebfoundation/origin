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

import * as ProducingAsset from './blockchain-facade/ProducingAsset';
import * as ConsumingAsset from './blockchain-facade/ConsumingAsset';
import * as Asset from './blockchain-facade/Asset';
import AssetPropertiesOffchainSchema from '../schemas/AssetPropertiesOffChain.schema.json';
import ProducingAssetPropertiesOffchainSchema from '../schemas/ProducingAssetPropertiesOffChain.schema.json';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';

export { AssetConsumingRegistryLogic } from './wrappedContracts/AssetConsumingRegistryLogic';
export { AssetProducingRegistryLogic } from './wrappedContracts/AssetProducingRegistryLogic';
export { AssetContractLookup } from './wrappedContracts/AssetContractLookup';
export { migrateAssetRegistryContracts } from './utils/migrateContracts';

import AssetConsumingDBJSON from '../build/contracts/AssetConsumingDB.json';
import AssetConsumingRegistryLogicJSON from '../build/contracts/AssetConsumingRegistryLogic.json';
import AssetProducingDBJSON from '../build/contracts/AssetProducingDB.json';
import AssetProducingRegistryLogicJSON from '../build/contracts/AssetProducingRegistryLogic.json';
import AssetContractLookupJSON from '../build/contracts/AssetContractLookup.json';

export {
    ProducingAsset,
    ConsumingAsset,
    Asset,
    AssetPropertiesOffchainSchema,
    ProducingAssetPropertiesOffchainSchema,
    createBlockchainProperties,
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON,
    AssetContractLookupJSON
};
