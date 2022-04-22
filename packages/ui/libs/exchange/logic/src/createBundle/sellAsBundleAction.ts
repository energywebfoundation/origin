import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatSelectedItems } from './formatSelectedItems';
import { SelectedItem, TUseSellAsBundleActionLogic } from './types';

export const useSellAsBundleActionLogic: TUseSellAsBundleActionLogic<
  AccountAssetDTO['asset']['id']
> = ({ selectedIds, exchangeCertificates, allDevices, allFuelTypes }) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<AccountAssetDTO['asset']['id']>[] =
    selectedIds
      ? formatSelectedItems({
          selectedIds,
          exchangeCertificates,
          allDevices,
          allFuelTypes,
        })
      : [];

  return {
    title: t('exchange.createPackage.selectedForSale'),
    buttonText: t('exchange.createPackage.sellAsPackageButton'),
    priceInputLabel: t('exchange.createPackage.price'),
    totalPriceText: t('exchange.createPackage.totalPrice'),
    selectedItems,
  };
};
