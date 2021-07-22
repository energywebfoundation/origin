import { useTranslation } from 'react-i18next';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import { SelectedItem, TUseWithdrawActionLogic } from './types';

export const useWithdrawActionLogic: TUseWithdrawActionLogic = <Id>({
  selectedIds,
  exchangeCertificates,
  allDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
    ? formatSelectedExchangeItems({
        selectedIds,
        exchangeCertificates,
        allDevices,
        allFuelTypes,
      })
    : [];

  return {
    title: t('certificate.exchangeInbox.selectedForWithdraw'),
    buttonText: t('certificate.exchangeInbox.withdrawButton'),
    selectedItems,
  };
};
