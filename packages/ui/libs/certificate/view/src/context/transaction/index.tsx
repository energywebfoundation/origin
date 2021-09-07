import React, { createContext, useContext, useState } from 'react';
import { FC } from 'react';

const TransactionPendingStore = createContext<boolean>(null);
const TransactionPendingDispatch = createContext<
  React.Dispatch<React.SetStateAction<boolean>>
>(null);

export const TransactionPendingProvider: FC = ({ children }) => {
  const [txPending, setTxPending] = useState(false);

  return (
    <TransactionPendingStore.Provider value={txPending}>
      <TransactionPendingDispatch.Provider value={setTxPending}>
        {children}
      </TransactionPendingDispatch.Provider>
    </TransactionPendingStore.Provider>
  );
};

export const useTransactionPendingStore = () => {
  return useContext(TransactionPendingStore);
};

export const useTransactionPendingDispatch = () => {
  return useContext(TransactionPendingDispatch);
};
