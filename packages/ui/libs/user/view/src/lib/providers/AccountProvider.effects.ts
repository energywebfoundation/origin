import { useEffect, useMemo, useState } from 'react';
import { IAccountContextState } from '@energyweb/origin-ui-user-view';
import { useApiFetchUserProfileData } from '@energyweb/origin-ui-user-data-access';

export const useAccountProviderEffects = () => {
  const [refreshTimestampToken, setRefreshTimestampToken] =
    useState<number>(null);
  const [account, setAccount] = useState<IAccountContextState>({
    isFetchingUserAccountData: null,
    isUserAccountDataFetched: null,
    userAccountData: null,
  });
  const { isFetched, isFetching, data } = useApiFetchUserProfileData(
    refreshTimestampToken
  );
  useEffect(() => {
    if (isFetched) {
      setAccount({
        userAccountData: data,
        isUserAccountDataFetched: isFetched,
        isFetchingUserAccountData: isFetching,
      });
    }
  }, [isFetched]);

  return useMemo(
    () => ({
      account,
      setAccount,
      setRefreshTimestampToken,
    }),
    [account]
  );
};
