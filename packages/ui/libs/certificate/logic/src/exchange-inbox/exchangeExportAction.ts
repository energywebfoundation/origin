import { AccountAssetDTO } from '@energyweb/exchange-react-query-client';
import { useTranslation } from 'react-i18next';
import { formatSelectedExchangeItems } from './formatSelectedExchangeItems';
import { SelectedItem, TUseExchangeExportActionLogic } from './types';

export const useExchangeExportActionLogic: TUseExchangeExportActionLogic<
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
    title: t('certificate.exchangeInbox.selectedForExport'),
    buttonText: t('certificate.exchangeInbox.exportButton'),
    addressInputLabel: t('certificate.exchangeInbox.iRecAccountId'),
    inputHeader: t('certificate.exchangeInbox.exportTo'),
    selectedItems,
  };
};
