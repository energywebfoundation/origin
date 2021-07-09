import {
  useAllFuelTypes,
  useAllBlockchainCertificates,
  useApiMyDevices,
} from '@energyweb/origin-ui-certificate-data';
import { useBlockchainInboxLogic } from '@energyweb/origin-ui-certificate-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import {
  DepositAction,
  RetireAction,
  ListItemContent,
  ListItemHeader,
} from '../../containers';

export const useBlockchainInboxPageEffects = () => {
  const { t } = useTranslation();

  const { blockchainCertificates, isLoading: areCertificatesLoading } =
    useAllBlockchainCertificates();
  const { myDevices, isLoading: areDevicesLoading } = useApiMyDevices();
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
  ];

  const listProps = useBlockchainInboxLogic({
    blockchainCertificates,
    myDevices,
    allFuelTypes,
    actions,
    ListItemHeader,
    ListItemContent,
  });

  const noCertificatesText = t('certificate.inbox.noCertificates');

  return { isLoading, listProps, noCertificatesText };
};
