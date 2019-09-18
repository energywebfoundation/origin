import AssetConsumingDBJSON from './build/contracts/AssetConsumingDB.json';
import AssetConsumingRegistryLogicJSON from './build/contracts/AssetConsumingRegistryLogic.json';
import AssetProducingDBJSON from './build/contracts/AssetProducingDB.json';
import AssetProducingRegistryLogicJSON from './build/contracts/AssetProducingRegistryLogic.json';
import AssetContractLookupJSON from './build/contracts/AssetContractLookup.json';

export { migrateAssetRegistryContracts } from './src/utils/migrateContracts';

export {
    AssetConsumingDBJSON,
    AssetConsumingRegistryLogicJSON,
    AssetProducingDBJSON,
    AssetProducingRegistryLogicJSON,
    AssetContractLookupJSON
};
