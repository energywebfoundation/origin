import { useUserBlockchainAccountAddressFormConfig } from '@energyweb/origin-ui-user-logic';
import { useApiUpdateOwnBlockchainAddress } from '@energyweb/origin-ui-user-data-access';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';

export const useUserBlockchainAccountAddressEffects = (user: UserDTO) => {
  const { submitHandler } = useApiUpdateOwnBlockchainAddress();
  const formConfig = useUserBlockchainAccountAddressFormConfig(
    user?.organization?.blockchainAccountAddress,
    submitHandler
  );
  return { formConfig };
};
