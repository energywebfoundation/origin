import {
  AccountAssetDTO,
  getAccountBalanceControllerGetQueryKey,
  RequestSendDTO,
  useTransferControllerRequestSend,
} from '@energyweb/exchange-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useExchangeTransferCertificateHandler = (
  receiverAddress: string,
  resetList: () => void,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();
  const { mutate } = useTransferControllerRequestSend();

  return <Id>(id: Id, amount: string) => {
    setTxPending(true);
    const formattedAmount = PowerFormatter.getBaseValueFromValueInDisplayUnit(
      Number(amount)
    ).toString();

    const preparedData: RequestSendDTO = {
      assetId: id as unknown as AccountAssetDTO['asset']['id'],
      amount: formattedAmount,
      address: receiverAddress,
    };

    mutate(
      { data: preparedData },
      {
        onSuccess: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.transferSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.resetQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.exchangeInbox.notifications.transferError')}:
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
