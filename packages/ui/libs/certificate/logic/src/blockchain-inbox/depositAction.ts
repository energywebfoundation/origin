import { useTranslation } from 'react-i18next';
import { formatSelectedBlockchainItems } from './formatSelectedBlockchain';
import { SelectedItem, TUseDepositActionLogic } from './types';

export const useDepositActionLogic: TUseDepositActionLogic = <Id>({
  selectedIds,
  blockchainCertificates,
  allDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
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
