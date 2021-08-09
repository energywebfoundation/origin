import { useExchangeDepositAddressLogic } from '@energyweb/origin-ui-user-logic';
import {
  useApiCreateExchangeBlockchainAddress,
  useExchangeAddress,
} from '@energyweb/origin-ui-user-data';
import { useEffect, useRef, useState } from 'react';

export const useUserExchangeDepositAddressEffects = () => {
  const [isCreating, setIsCreating] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => (isMountedRef.current = false);
  }, []);

  const { submitHandler } = useApiCreateExchangeBlockchainAddress(
    setIsCreating,
    isMountedRef
  );
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
