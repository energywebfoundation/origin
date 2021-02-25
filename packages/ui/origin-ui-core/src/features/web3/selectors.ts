import { ethers } from 'ethers';
import { ICoreState } from '../../types';

export const getWeb3 = (state: ICoreState): ethers.providers.JsonRpcProvider =>
    state.web3State.web3;
