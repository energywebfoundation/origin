import UserDBJSON from './build/contracts/UserDB.json';
import UserLogicJSON from './build/contracts/UserLogic.json';
import UserContractLookupJSON from './build/contracts/UserContractLookup.json';

export { migrateUserRegistryContracts } from './src/utils/migrateContracts';
export { UserDBJSON, UserLogicJSON, UserContractLookupJSON };
