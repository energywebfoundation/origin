import React, { createContext, memo, ReactNode, useContext } from 'react';
import { UserDTO } from '@energyweb/origin-backend-client';
import { useAccountProviderEffects } from './AccountProvider.effects';

type AccountProviderProps = {
  children: ReactNode;
  initialState?: IAccountContextState;
};
export interface IAccountContextState {
  userAccountData: UserDTO;
  isUserAccountDataFetched: boolean;
  isFetchingUserAccountData: boolean;
}

type Dispatch = (newContextState: IAccountContextState) => void;

const AccountContext = createContext<IAccountContextState>({
  isFetchingUserAccountData: null,
  isUserAccountDataFetched: null,
  userAccountData: null,
});
const AccountDispatchContext = createContext<Dispatch | null>(null);

const AccountProvider = memo(({ children }: AccountProviderProps) => {
  const { account, setAccount } = useAccountProviderEffects();
  return (
    <AccountContext.Provider value={account}>
      <AccountDispatchContext.Provider value={setAccount}>
        {children}
      </AccountDispatchContext.Provider>
    </AccountContext.Provider>
  );
});

const useAccount = (): IAccountContextState => {
  return useContext<IAccountContextState>(AccountContext);
};

const useAccountUserRole = () => useAccount().userAccountData?.rights;

const useAccountDispatch = (): Dispatch => {
  const context = useContext<Dispatch | null>(AccountDispatchContext);

  if (context === null) {
    throw new Error('useAccountDispatch must be used within a AccountProvider');
  }
  return context;
};

export { AccountProvider, useAccount, useAccountDispatch, useAccountUserRole };
