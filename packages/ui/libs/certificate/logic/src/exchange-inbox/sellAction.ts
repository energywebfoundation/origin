import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import { SelectedItem, TUseSellActionLogic } from './types';

export const useSellActionLogic: TUseSellActionLogic<
  AccountAssetDTO['asset']['id']
> = ({ selectedIds, exchangeCertificates, allDevices, allFuelTypes }) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<
    AccountAssetDTO['asset']['id']
  >[] = selectedIds
    ? formatSelectedExchangeItems({
        selectedIds,
        exchangeCertificates,
        allDevices,
        allFuelTypes,
      })
    : [];

  return {
    title: t('certificate.exchangeInbox.selectedForSale'),
    buttonText: t('certificate.exchangeInbox.sellButton'),
    priceInputLabel: t('certificate.exchangeInbox.price'),
    totalPriceText: t('certificate.exchangeInbox.totalPrice'),
    selectedItems,
  };
};
