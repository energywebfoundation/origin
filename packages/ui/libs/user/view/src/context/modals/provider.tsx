import React, { createContext, useContext, useReducer } from 'react';
import { userModalsInitialState, userModalsReducer } from './reducer';
import { IUserModalsStore, TUserModalsAction } from './types';

const UserModalsStore = createContext<IUserModalsStore>(null);
const UserModalsDispatch = createContext<React.Dispatch<TUserModalsAction>>(
  null
);

export const UserModalsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    userModalsReducer,
    userModalsInitialState
  );

  return (
    <UserModalsStore.Provider value={state}>
      <UserModalsDispatch.Provider value={dispatch}>
        {children}
      </UserModalsDispatch.Provider>
    </UserModalsStore.Provider>
  );
};

export const useUserModalsStore = () => {
  return useContext(UserModalsStore);
};

export const useUserModalsDispatch = () => {
  return useContext(UserModalsDispatch);
};
