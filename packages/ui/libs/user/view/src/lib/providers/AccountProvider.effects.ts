import { useEffect, useMemo, useState } from 'react';
import { IAccountContextState } from '@energyweb/origin-ui-user-view';
import { useApiAdminFetchUserAccountData } from '@energyweb/origin-ui-user-data-access';

export const useAccountProviderEffects = () => {
  const [account, setAccount] = useState<IAccountContextState>({
    isFetchingUserAccountData: null,
    isUserAccountDataFetched: null,
    userAccountData: null,
  });
  const { isFetched, isFetching, data } = useApiAdminFetchUserAccountData();

  useEffect(() => {
    if (isFetched) {
      setAccount({
        userAccountData: data,
        isUserAccountDataFetched: isFetched,
        isFetchingUserAccountData: isFetching,
      });
    }
  }, [isFetched]);

  return useMemo(() => ({ account, setAccount }), [account]);
};
