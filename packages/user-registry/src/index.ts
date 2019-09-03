import * as User from './blockchain-facade/Users/User';

export { UserLogic } from './wrappedContracts/UserLogic';
export { UserContractLookup } from './wrappedContracts/UserContractLookup';

import UserDBJSON from '../build/contracts/UserDB.json';
import UserLogicJSON from '../build/contracts/UserLogic.json';
import UserContractLookupJSON from '../build/contracts/UserContractLookup.json';
export { UserDBJSON, UserLogicJSON, UserContractLookupJSON };

export { migrateUserRegistryContracts } from './utils/migrateContracts';
export { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
export * from './wrappedContracts/RoleManagement';
export { User };
