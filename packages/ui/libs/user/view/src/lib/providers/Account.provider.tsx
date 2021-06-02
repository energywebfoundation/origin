import React, { createContext, memo, ReactNode, useContext } from 'react';
import { UserDTO } from '@energyweb/origin-backend-react-query-client';
import { useAccountProviderEffects } from './AccountProvider.effects';
import { assertHasContext } from '@energyweb/origin-ui-utils';
import dayjs from 'dayjs';

type AccountProviderProps = {
  children: ReactNode;
  initialState?: IAccountContextState;
};
export interface IAccountContextState {
  userAccountData: UserDTO;
  isUserAccountDataFetched: boolean;
  isFetchingUserAccountData: boolean;
}

type DispatchSetRefreshToken = () => void;

const AccountContext = createContext<IAccountContextState>({
  isFetchingUserAccountData: null,
  isUserAccountDataFetched: null,
  userAccountData: null,
});

const AccountSetRefreshTokenDispatchContext =
  createContext<DispatchSetRefreshToken | null>(null);

const AccountProvider = memo(({ children }: AccountProviderProps) => {
  const { account, setRefreshTimestampToken } = useAccountProviderEffects();
  return (
    <AccountContext.Provider value={account}>
      <AccountSetRefreshTokenDispatchContext.Provider
        value={() => setRefreshTimestampToken(dayjs().unix())}
      >
        {children}
      </AccountSetRefreshTokenDispatchContext.Provider>
    </AccountContext.Provider>
  );
});

const useAccount = (): IAccountContextState => {
  assertHasContext(AccountContext, 'useAccount', 'AccountContext');
  return useContext<IAccountContextState>(AccountContext);
};

const useAccountUserRole = () => useAccount().userAccountData?.rights;

const useAccountSetRefreshTokenDispatch = (): DispatchSetRefreshToken => {
  assertHasContext(
    AccountSetRefreshTokenDispatchContext,
    'useAccountDispatch',
    'AccountSetRefreshTokenDispatchContext'
  );
  return useContext<DispatchSetRefreshToken | null>(
    AccountSetRefreshTokenDispatchContext
  );
};

export {
  AccountProvider,
  useAccount,
  useAccountSetRefreshTokenDispatch,
  useAccountUserRole,
};
