import { useTranslation } from 'react-i18next';
import { formatSelectedBlockchainItems } from './formatSelectedBlockchain';
import { SelectedItem, TUseBlockchainTransferActionLogic } from './types';

export const useBlockchainTransferActionLogic: TUseBlockchainTransferActionLogic =
  <Id>({ selectedIds, blockchainCertificates, allDevices, allFuelTypes }) => {
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
