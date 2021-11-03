import { Web3Provider } from '@ethersproject/providers';
import { MetamaskAdapter } from '../adapters';

export interface IWeb3Context {
  // extend when add new adapter
  connect: (adapter: MetamaskAdapter) => Promise<void>;
  disconnect: () => Promise<void>;
  isActive?: boolean;
  web3?: Web3Provider;
  account?: string | null;
  chainId?: number;
}
