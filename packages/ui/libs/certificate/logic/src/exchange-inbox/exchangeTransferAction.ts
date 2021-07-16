import { useTranslation } from 'react-i18next';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import { SelectedItem, TUseExchangeTransferActionLogic } from './types';

export const useExchangeTransferActionLogic: TUseExchangeTransferActionLogic = <
  Id
>({
  selectedIds,
  exchangeCertificates,
  allDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
    ? formatSelectedExchangeItems({
        selectedIds,
        allDevices,
        exchangeCertificates,
        allFuelTypes,
      })
    : [];

  return {
    title: t('certificate.exchangeInbox.selectedForTransfer'),
    buttonText: t('certificate.exchangeInbox.transferButton'),
    addressInputLabel: t('certificate.exchangeInbox.exchangeAddress'),
    selectedItems,
  };
};
