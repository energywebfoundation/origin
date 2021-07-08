import React, { FC, useEffect } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { injectedConnector } from './connectors';

export const withMetamask = (Component: FC<any>) => {
  const ComponentWithMetamask = (props: any) => {
    const { activate } = useWeb3React();

    const noMetamaskInstalled = !(
      (window as any).web3 || (window as any).ethereum
    );

    useEffect(() => {
      if (noMetamaskInstalled) {
        showNotification(
          'This page requires Metamask to be installed',
          NotificationTypeEnum.Warning
        );
      } else {
        activate(injectedConnector, undefined, true).catch((error) => {
          if (error instanceof UnsupportedChainIdError) {
            showNotification(
              `You are connected to the unsupported network`,
              NotificationTypeEnum.Error
            );
          } else {
            showNotification(
              `Unknown error while connecting wallet. Please reload the page`,
              NotificationTypeEnum.Error
            );
          }
        });
      }
    }, []);

    return <Component {...props} />;
  };

  return ComponentWithMetamask;
};
