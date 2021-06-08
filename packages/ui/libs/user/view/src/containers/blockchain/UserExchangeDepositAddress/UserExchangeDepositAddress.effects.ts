import { useExchangeDepositAddressLogic } from '@energyweb/origin-ui-user-logic';
import {
  useApiCreateExchangeBlockchainAddress,
  useExchangeAddress,
} from '@energyweb/origin-ui-user-data';
import { useState } from 'react';

export const useUserExchangeDepositAddressEffects = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { submitHandler } =
    useApiCreateExchangeBlockchainAddress(setIsCreating);
  const { exchangeAddress, isLoading } = useExchangeAddress();
  const { title, buttonText, popoverText } = useExchangeDepositAddressLogic();
  return {
    isCreating,
    submitHandler,
    exchangeAddress,
    isLoading,
    title,
    buttonText,
    popoverText,
  };
};
