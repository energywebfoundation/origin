import Erc20TestTokenJSON from '../build/contracts/Erc20TestToken.json';
import Erc721TestReceiverJSON from '../build/contracts/TestReceiver.json';
import { deployERC20TestToken, deployERC721TestReceiver } from './deployment/deploy';
import { Erc20TestToken } from './wrappedContracts/Erc20TestToken';
import { TestReceiver } from './wrappedContracts/TestReceiver';

export { Erc20TestTokenJSON, Erc721TestReceiverJSON, deployERC20TestToken, deployERC721TestReceiver, Erc20TestToken, TestReceiver };
