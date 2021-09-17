import {
  useAllFuelTypes,
  useAllBlockchainCertificates,
  useApiAllDevices,
  useApiUserAndAccount,
} from '@energyweb/origin-ui-certificate-data';
import {
  useBlockchainInboxLogic,
  useBlockchainInboxPermissionsLogic,
} from '@energyweb/origin-ui-certificate-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import {
  ListItemContent,
  ListItemHeader,
  DepositAction,
  RetireAction,
  BlockchainTransferAction,
} from '../../containers';
import { useTransactionPendingStore } from '../../context';

export const useBlockchainInboxPageEffects = () => {
  const { t } = useTranslation();
  const txPending = useTransactionPendingStore();

  const {
    user,
    exchangeDepositAddress,
    isLoading: userAndAccountLoading,
  } = useApiUserAndAccount();
  const {
    canAccessPage,
    requirementsProps,
  } = useBlockchainInboxPermissionsLogic({
    user,
    exchangeDepositAddress,
  });

  const {
    blockchainCertificates,
    isLoading: areCertificatesLoading,
  } = useAllBlockchainCertificates();
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
      name: t('certificate.blockchainInbox.depositActionTitle'),
      component: DepositAction,
    },
    {
      name: t('certificate.blockchainInbox.retireActionTitle'),
      component: RetireAction,
    },
    {
      name: t('certificate.blockchainInbox.transferActionTitle'),
      component: BlockchainTransferAction,
    },
  ];

  const listProps = useBlockchainInboxLogic({
    blockchainCertificates,
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
