import { useTranslation } from 'react-i18next';
import { formatSelectedBlockchainItems } from './formatSelectedBlockchain';
import { SelectedItem, TUseTransferActionLogic } from './types';

export const useTransferActionLogic: TUseTransferActionLogic = <Id>({
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
    title: t('certificate.blockchainInbox.selectedForTransfer'),
    buttonText: t('certificate.blockchainInbox.transferButton'),
    addressInputLabel: t('certificate.blockchainInbox.blockchainAddress'),
    selectedItems,
  };
};
