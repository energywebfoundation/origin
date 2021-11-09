import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import { SelectedItem, TUseExchangeTransferActionLogic } from './types';

export const useExchangeTransferActionLogic: TUseExchangeTransferActionLogic<
  AccountAssetDTO['asset']['id']
> = ({ selectedIds, exchangeCertificates, allDevices, allFuelTypes }) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<AccountAssetDTO['asset']['id']>[] =
    selectedIds
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
