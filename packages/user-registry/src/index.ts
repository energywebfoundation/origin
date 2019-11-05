import * as User from './blockchain-facade/Users/User';

import { migrateUserRegistryContracts } from './utils/migrateContracts';
import { UserLogic } from './wrappedContracts/UserLogic';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
import { RoleManagement, buildRights, Role } from './wrappedContracts/RoleManagement';

export {
    buildRights,
    Role,
    migrateUserRegistryContracts,
    UserLogic,
    RoleManagement,
    createBlockchainProperties,
    User
};
