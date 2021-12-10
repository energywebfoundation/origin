import { useCachedUser } from '@energyweb/origin-ui-user-data';

export const useBlockchainAddressesEffects = () => {
  const user = useCachedUser();
  const userHasBlockchainAddressAttached = Boolean(
    user?.organization?.blockchainAccountAddress
  );
  return { userHasBlockchainAddressAttached };
};
