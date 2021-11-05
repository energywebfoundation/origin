import { useCallback, useEffect, useReducer } from 'react';
import { MetamaskAdapter } from '../adapters';
import { Web3ActionsEnum } from './actions';
import type {
  IWeb3State,
  UpdateWeb3Values,
  UseWeb3State,
  Web3Action,
} from './types';

const reducer = (state: IWeb3State, action: Web3Action): IWeb3State => {
  switch (action.type) {
    case Web3ActionsEnum.UPDATE_STATE:
      return { ...state, ...action.payload };
    case Web3ActionsEnum.RESET_STATE:
      return {};
    default:
      return state;
  }
};

export const useWeb3State: UseWeb3State = () => {
  const [state, dispatch] = useReducer(reducer, {});

  const handleUpdate = useCallback((payload: UpdateWeb3Values) => {
    dispatch({
      type: Web3ActionsEnum.UPDATE_STATE,
      payload,
    });
  }, []);

  const handleClose = useCallback(() => {
    dispatch({ type: Web3ActionsEnum.RESET_STATE });
  }, []);

  // extend when adding new adapters
  const connect = useCallback(async (adapter: MetamaskAdapter) => {
    const { account, provider, chainId } = await adapter.enable(
      handleUpdate,
      handleClose
    );
    dispatch({
      type: Web3ActionsEnum.UPDATE_STATE,
      payload: {
        account,
        chainId,
        provider,
        adapter: account && provider && chainId ? adapter : undefined,
      },
    });
  }, []);

  const disconnect = useCallback(async () => {
    if (state.adapter) await state.adapter.disable();
    return;
  }, [state.adapter]);

  // removing subscription and reseting state on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    handleUpdate,
    handleClose,
  };
};
