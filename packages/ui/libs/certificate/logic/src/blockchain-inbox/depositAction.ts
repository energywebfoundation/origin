import { CertificateDTO } from '@energyweb/issuer-irec-api-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatSelectedBlockchainItems } from './formatSelectedBlockchain';
import { SelectedItem, TUseDepositActionLogic } from './types';

export const useDepositActionLogic: TUseDepositActionLogic<
  CertificateDTO['id']
> = ({ selectedIds, blockchainCertificates, allDevices, allFuelTypes }) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<CertificateDTO['id']>[] = selectedIds
    ? formatSelectedBlockchainItems({
        selectedIds,
        allDevices,
        blockchainCertificates,
        allFuelTypes,
      })
    : [];

  return {
    title: t('certificate.blockchainInbox.selectedForDeposit'),
    buttonText: t('certificate.blockchainInbox.depositButton'),
    selectedItems,
  };
};
