import { useUserExchangeDepositAddressFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiCreateExchangeBlockchainAddress } from '@energyweb/origin-ui-user-data-access';
import { useBlockchainExchangeDepositAddress } from '@energyweb/origin-ui-blockchain';

export const useUserExchangeDepositAddressEffects = () => {
  const { submitHandler } = useApiCreateExchangeBlockchainAddress();
  const exchangeDepositAddress = useBlockchainExchangeDepositAddress();
  const formConfig = useUserExchangeDepositAddressFormConfig(
    exchangeDepositAddress,
    submitHandler
  );
  return { formConfig };
};
