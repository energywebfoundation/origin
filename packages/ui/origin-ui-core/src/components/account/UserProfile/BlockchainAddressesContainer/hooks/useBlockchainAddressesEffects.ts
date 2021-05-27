import { useDispatch, useSelector } from 'react-redux';
import {
  fromGeneralSelectors,
  fromUsersActions,
  fromUsersSelectors,
} from '../../../../../features';
import { useCallback } from 'react';

export const useBlockchainAddressesEffects = () => {
  const dispatch = useDispatch();
  const activeBlockchainAccountAddress = useSelector(
    fromUsersSelectors.getActiveBlockchainAccountAddress
  );
  const isLoading = useSelector(fromGeneralSelectors.getLoading);
  const exchangeAddress = useSelector(
    fromUsersSelectors.getExchangeDepositAddress
  );
  const user = useSelector(fromUsersSelectors.getUserOffchain);

  const formData = {
    blockchainAccountAddress: user.organization?.blockchainAccountAddress ?? '',
    exchangeDepositAddress: exchangeAddress ?? '',
  };

  return {
    activeBlockchainAccountAddress,
    exchangeAddress,
    user,
    formData,
    isLoading,
    createExchangeAddress: useCallback(() => {
      dispatch(fromUsersActions.createExchangeDepositAddress());
    }, []),
    updateBlockchainAccount: useCallback((): void => {
      dispatch(
        fromUsersActions.updateUserBlockchain({
          user,
          activeAccount: activeBlockchainAccountAddress,
        })
      );
    }, []),
  };
};
