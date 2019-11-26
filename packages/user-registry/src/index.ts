import * as User from './blockchain-facade/Users/User';

import { UserLogic } from './wrappedContracts/UserLogic';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
import { RoleManagement, buildRights, Role } from './wrappedContracts/RoleManagement';
import * as Contracts from './contracts';

export {
    buildRights,
    Role,
    UserLogic,
    RoleManagement,
    createBlockchainProperties,
    User,
    Contracts
};
