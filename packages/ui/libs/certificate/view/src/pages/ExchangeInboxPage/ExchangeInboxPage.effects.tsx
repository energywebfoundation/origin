import {
  useAllFuelTypes,
  useApiAllDevices,
  useApiAllExchangeCertificates,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-certificate-data';
import {
  useExchangeInboxLogic,
  usePermissionsLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import {
  ListItemContent,
  ListItemHeader,
  SellAction,
  WithdrawAction,
  ExchangeTransferAction,
} from '../../containers';
import { useTransactionPendingStore } from '../../context';

export const useExchangeInboxPageEffects = () => {
  const { t } = useTranslation();
  const txPending = useTransactionPendingStore();

  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const { canAccessPage, requirementsProps } = usePermissionsLogic({
    user,
    exchangeDepositAddress,
  });

  const {
    exchangeCertificates,
    isLoading: areCertificatesLoading,
  } = useApiAllExchangeCertificates();
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const {
    allTypes: allFuelTypes,
    isLoading: areFuelTypesLoading,
  } = useAllFuelTypes();

  const isLoading =
    areCertificatesLoading ||
    areDevicesLoading ||
    areFuelTypesLoading ||
    userAndAccountLoading;

  const actions: ListAction[] = [
    {
      name: t('certificate.exchangeInbox.sellActionTitle'),
      component: SellAction,
    },
    {
      name: t('certificate.exchangeInbox.withdrawActionTitle'),
      component: WithdrawAction,
    },
    {
      name: t('certificate.exchangeInbox.transferActionTitle'),
      component: ExchangeTransferAction,
    },
  ];

  const listProps = useExchangeInboxLogic({
    exchangeCertificates,
    allDevices,
    allFuelTypes,
    actions,
    ListItemHeader,
    ListItemContent,
  });

  const noCertificatesText = t('certificate.inbox.noCertificates');

  return {
    isLoading,
    listProps,
    noCertificatesText,
    canAccessPage,
    requirementsProps,
    txPending,
  };
};
