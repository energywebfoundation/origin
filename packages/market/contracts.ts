import MarketContractLookupJSON from './build/contracts/MarketContractLookup.json';
import MarketDBJSON from './build/contracts/MarketDB.json';
import MarketLogicJSON from './build/contracts/MarketLogic.json';
import AgreementLogicJSON from './build/contracts/AgreementLogic.json';

export { AgreementLogicJSON, MarketContractLookupJSON, MarketDBJSON, MarketLogicJSON };
export { migrateMarketRegistryContracts } from './src/utils/migrateContracts';