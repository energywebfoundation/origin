import { useTranslation } from 'react-i18next';
import { formatSelectedItems } from './formatSelectedItems';
import { SelectedItem, TUseSellAsBundleActionLogic } from './types';

export const useSellAsBundleActionLogic: TUseSellAsBundleActionLogic = <Id>({
  selectedIds,
  exchangeCertificates,
  allDevices,
  allFuelTypes,
}) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<Id>[] = selectedIds
    ? formatSelectedItems({
        selectedIds,
        exchangeCertificates,
        allDevices,
        allFuelTypes,
      })
    : [];

  return {
    title: t('exchange.createBundle.selectedForSale'),
    buttonText: t('exchange.createBundle.sellAsBundleButton'),
    priceInputLabel: t('exchange.createBundle.price'),
    totalPriceText: t('exchange.createBundle.totalPrice'),
    selectedItems,
  };
};
