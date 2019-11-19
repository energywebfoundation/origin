import MarketLogicJSON from './build/contracts/MarketLogic.json';
import Erc20TestTokenJSON from './build/contracts/Erc20TestToken.json';

export { MarketLogicJSON, Erc20TestTokenJSON };

export { deployERC20TestToken } from './src/utils/deployERC20TestToken';
export { Erc20TestToken } from './src/wrappedContracts/Erc20TestToken';
export { migrateMarketRegistryContracts } from './src/utils/migrateContracts';
