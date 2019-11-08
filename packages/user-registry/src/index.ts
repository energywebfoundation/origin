import * as User from './blockchain-facade/Users/User';

import { UserLogic } from './wrappedContracts/UserLogic';
import { createBlockchainProperties } from './blockchain-facade/BlockchainPropertiesFactory';
import { RoleManagement, buildRights, Role } from './wrappedContracts/RoleManagement';

export { buildRights, Role, UserLogic, RoleManagement, createBlockchainProperties, User };
