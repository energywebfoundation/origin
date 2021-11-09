import React, { memo } from 'react';
import { useWeb3 } from '../../provider';

export const withMetamask = (
  Component: React.FC<any>,
  PlaceholderComponent: React.FC
) => {
  const ComponentWithMetamask = memo((props: any) => {
    const web3Context = useWeb3();

    if (!web3Context) {
      throw new Error(
        'withMetamask HOC must be wrapped in Web3ContextProvider'
      );
    }

    if (!web3Context.account) return <PlaceholderComponent />;

    return <Component {...props} />;
  });

  ComponentWithMetamask.displayName = Component.name;

  return ComponentWithMetamask;
};
