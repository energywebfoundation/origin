import * as ProducingAsset from './blockchain-facade/ProducingAsset';
import * as ConsumingAsset from './blockchain-facade/ConsumingAsset';
import * as Asset from './blockchain-facade/Asset';

import AssetPropertiesOffChainSchema from '../schemas/AssetPropertiesOffChain.schema.json';
import ProducingAssetPropertiesOffChainSchema from '../schemas/ProducingAssetPropertiesOffChain.schema.json';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';

import { AssetLogic } from './wrappedContracts/AssetLogic';

export {
    ProducingAsset,
    ConsumingAsset,
    Asset,
    AssetLogic,
    AssetPropertiesOffChainSchema,
    ProducingAssetPropertiesOffChainSchema,
    createBlockchainProperties
};
