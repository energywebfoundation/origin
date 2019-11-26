import MarketLogicJSON from '../build/contracts/MarketLogic.json';
import Erc20TestTokenJSON from '../build/contracts/Erc20TestToken.json';

export { MarketLogicJSON, Erc20TestTokenJSON };

export { deployERC20TestToken } from './utils/deployERC20TestToken';
export { Erc20TestToken } from './wrappedContracts/Erc20TestToken';
export { migrateMarketRegistryContracts } from './utils/migrateContracts';
