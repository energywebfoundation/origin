import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import {
  MetamaskAdapter,
  NotAllowedChainIdError,
  useWeb3,
} from '@energyweb/origin-ui-web3';
import { useTranslation } from 'react-i18next';

export const useConnectMetamaskPlaceholderLogic = (
  allowedChainIds: number[]
) => {
  const { t } = useTranslation();
  const { connect } = useWeb3();

  const handleInstall = () => {
    window.location.replace('https://metamask.io/');
  };

  const handleError = (error: any) => {
    if (error instanceof NotAllowedChainIdError) {
      showNotification(
        t('metamask.notifications.unsupportedNetwork'),
        NotificationTypeEnum.Error
      );
    } else {
      showNotification(
        t('metamask.notifications.unknownError'),
        NotificationTypeEnum.Error
      );
    }
  };

  const handleConnect = async () => {
    await connect(new MetamaskAdapter(allowedChainIds, handleError));
  };

  const noMetamaskInstalled = !(
    (window as any).web3 || (window as any).ethereum
  );

  const clickHandler = noMetamaskInstalled ? handleInstall : handleConnect;

  const buttonText = noMetamaskInstalled
    ? t('metamask.installMetamask')
    : t('metamask.connectMetamask');

  const title = t('metamask.blockRequireInstalledAndConnected');

  return { clickHandler, buttonText, title };
};
