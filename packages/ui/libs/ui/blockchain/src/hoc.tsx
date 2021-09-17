import React, { FC } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ConnectMetamask } from './components';

export const withMetamask = (Component: FC<any>) => {
  const ComponentWithMetamask = (props: any) => {
    const { account } = useWeb3React();

    if (!account) return <ConnectMetamask />;

    return <Component {...props} />;
  };

  return ComponentWithMetamask;
};
