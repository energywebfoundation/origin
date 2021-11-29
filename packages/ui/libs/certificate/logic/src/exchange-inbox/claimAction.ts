import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import { SelectedItem, TUseClaimActionLogic } from './types';

export const useClaimActionLogic: TUseClaimActionLogic<
  AccountAssetDTO['asset']['id']
> = ({ selectedIds, exchangeCertificates, allDevices, allFuelTypes }) => {
  const { t } = useTranslation();

  const selectedItems: SelectedItem<AccountAssetDTO['asset']['id']>[] =
    selectedIds
      ? formatSelectedExchangeItems({
          selectedIds,
          exchangeCertificates,
          allDevices,
          allFuelTypes,
        })
      : [];

  return {
    title: t('certificate.exchangeInbox.selectedForClaim'),
    buttonText: t('certificate.exchangeInbox.claimButton'),
    selectedItems,
  };
};
