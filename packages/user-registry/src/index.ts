import * as User from './blockchain-facade/Users/User';

import UserDBJSON from '../build/contracts/UserDB.json';
import UserLogicJSON from '../build/contracts/UserLogic.json';
import UserContractLookupJSON from '../build/contracts/UserContractLookup.json';

export { UserLogic } from './wrappedContracts/UserLogic';
export { UserContractLookup } from './wrappedContracts/UserContractLookup';
export { UserDBJSON, UserLogicJSON, UserContractLookupJSON };

export { migrateUserRegistryContracts } from './utils/migrateContracts';
export { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
export * from './wrappedContracts/RoleManagement';
export { User };
