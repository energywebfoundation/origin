import { Web3Actions } from './actions';
import { ethers } from 'ethers';

export interface IWeb3UpdatedAction {
    type: Web3Actions.web3Updated;
    payload: ethers.providers.JsonRpcProvider;
}

export type TWeb3Updated = (payload: ethers.providers.JsonRpcProvider) => IWeb3UpdatedAction;

export interface IWeb3State {
    web3: ethers.providers.JsonRpcProvider;
}
