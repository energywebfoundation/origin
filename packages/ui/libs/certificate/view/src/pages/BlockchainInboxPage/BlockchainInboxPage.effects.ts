import {
  useAllFuelTypes,
  useAllBlockchainCertificates,
  useApiAllDevices,
  useApiPermissions,
} from '@energyweb/origin-ui-certificate-data';
import { useBlockchainInboxLogic } from '@energyweb/origin-ui-certificate-logic';
import { ListAction } from '@energyweb/origin-ui-core';
import { Requirement } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import {
  ListItemContent,
  ListItemHeader,
  DepositAction,
  RetireAction,
  BlockchainTransferAction,
} from '../../containers';

export const useBlockchainInboxPageEffects = () => {
  const { t } = useTranslation();

  const pageRequirements = [
    Requirement.IsLoggedIn,
    Requirement.IsActiveUser,
    Requirement.IsPartOfApprovedOrg,
    Requirement.HasOrganizationBlockchainAddress,
  ];

  const { permissions } = useApiPermissions(pageRequirements);

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
    pageRequirements,
    permissions,
  };
};
