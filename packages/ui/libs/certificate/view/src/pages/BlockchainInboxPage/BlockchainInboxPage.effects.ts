import {
  useAllFuelTypes,
  useAllBlockchainCertificates,
  useApiAllDevices,
} from '@energyweb/origin-ui-certificate-data';
import { useBlockchainInboxLogic } from '@energyweb/origin-ui-certificate-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import {
  ListItemContent,
  ListItemHeader,
  DepositAction,
  RetireAction,
  TransferAction,
} from '../../containers';

export const useBlockchainInboxPageEffects = () => {
  const { t } = useTranslation();

  const { blockchainCertificates, isLoading: areCertificatesLoading } =
    useAllBlockchainCertificates();
  const { allDevices, isLoading: areDevicesLoading } = useApiAllDevices();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllFuelTypes();

  const isLoading =
    areCertificatesLoading || areDevicesLoading || areFuelTypesLoading;

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
      component: TransferAction,
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

  return { isLoading, listProps, noCertificatesText };
};
