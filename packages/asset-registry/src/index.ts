import * as ProducingAsset from './blockchain-facade/ProducingAsset';
import * as ConsumingAsset from './blockchain-facade/ConsumingAsset';
import * as Asset from './blockchain-facade/Asset';
import AssetPropertiesOffchainSchema from '../schemas/AssetPropertiesOffChain.schema.json';
import ProducingAssetPropertiesOffchainSchema from '../schemas/ProducingAssetPropertiesOffChain.schema.json';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';

export { AssetConsumingRegistryLogic } from './wrappedContracts/AssetConsumingRegistryLogic';
export { AssetProducingRegistryLogic } from './wrappedContracts/AssetProducingRegistryLogic';
export { AssetContractLookup } from './wrappedContracts/AssetContractLookup';

export {
    ProducingAsset,
    ConsumingAsset,
    Asset,
    AssetPropertiesOffchainSchema,
    ProducingAssetPropertiesOffchainSchema,
    createBlockchainProperties
};
