import { useUserBlockchainAccountAddressFormConfig } from '@energyweb/origin-ui-user-logic';
import { useAccount } from '@energyweb/origin-ui-user-view';
import { useApiUpdateOwnBlockchainAddress } from '@energyweb/origin-ui-user-data-access';

export const useUserBlockchainAccountAddressEffects = () => {
  const { userAccountData } = useAccount();
  const { submitHandler } = useApiUpdateOwnBlockchainAddress();
  const formConfig = useUserBlockchainAccountAddressFormConfig(
    userAccountData.organization.blockchainAccountAddress,
    submitHandler
  );
  return { formConfig };
};
