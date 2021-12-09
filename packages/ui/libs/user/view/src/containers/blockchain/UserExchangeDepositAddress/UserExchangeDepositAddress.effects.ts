import { useExchangeDepositAddressLogic } from '@energyweb/origin-ui-user-logic';
import { useExchangeAddress } from '@energyweb/origin-ui-user-data';

export const useUserExchangeDepositAddressEffects = () => {
  const { exchangeAddress, isLoading } = useExchangeAddress();
  const { title, popoverText } = useExchangeDepositAddressLogic();

  return {
    exchangeAddress,
    isLoading,
    title,
    popoverText,
  };
};
