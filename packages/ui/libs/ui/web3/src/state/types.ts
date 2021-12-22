import { MetamaskAdapter, IEthereum } from '../adapters';
import { Web3ActionsEnum } from './actions';

export interface IWeb3State {
  // extend when add new adapter
  adapter?: MetamaskAdapter;

  // extend when add new adapter
  provider?: IEthereum;

  account?: string;
  chainId?: number;
}

export type UpdateWeb3Values = Pick<
  IWeb3State,
  'account' | 'chainId' | 'provider'
>;

export type Web3Action =
  | {
      type: Web3ActionsEnum.UPDATE_STATE;
      payload: Partial<IWeb3State>;
    }
  | {
      type: Web3ActionsEnum.RESET_STATE;
    };

export type UseWeb3State = () => IWeb3State & {
  // extend when add new adapter
  connect: (adapter: MetamaskAdapter) => Promise<void>;
  disconnect: () => Promise<void>;
};
