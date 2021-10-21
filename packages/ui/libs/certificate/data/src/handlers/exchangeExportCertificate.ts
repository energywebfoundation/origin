import {
  AccountAssetDTO,
  getAccountBalanceControllerGetQueryKey,
} from '@energyweb/exchange-react-query-client';
import {
  useExportControllerExportCertificate,
  ExportAssetDTO,
} from '@energyweb/exchange-irec-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useExchangeExportCertificateHandler = (
  recipientTradeAccount: string,
  resetList: () => void,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();
  const { mutate } = useExportControllerExportCertificate();

  return <Id>(id: Id, amount: string) => {
    setTxPending(true);
    const formattedAmount = PowerFormatter.getBaseValueFromValueInDisplayUnit(
      Number(amount)
    ).toString();

    const preparedData: ExportAssetDTO = {
      assetId: id as unknown as AccountAssetDTO['asset']['id'],
      amount: formattedAmount,
      recipientTradeAccount,
    };

    mutate(
      { data: preparedData },
      {
        onSuccess: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.exportSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.resetQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.exchangeInbox.notifications.exportError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
        onSettled: () => setTxPending(false),
      }
    );
  };
};
