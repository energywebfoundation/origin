import {
  AccountAssetDTO,
  getAccountBalanceControllerGetQueryKey,
  RequestWithdrawalDTO,
  useTransferControllerRequestWithdrawal,
} from '@energyweb/exchange-react-query-client';
import {
  showNotification,
  NotificationTypeEnum,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useWithdrawCertificateHandler = (
  address: string,
  exchangeCertificates: AccountAssetDTO[],
  resetList: () => void
) => {
  const { t } = useTranslation();
  const { mutate } = useTransferControllerRequestWithdrawal();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();

  return <Id>(id: Id, amount: string) => {
    const assetId = exchangeCertificates.find(
      (cert) =>
        cert.asset.id === (id as unknown as AccountAssetDTO['asset']['id'])
    )?.asset.id;

    const data: RequestWithdrawalDTO = {
      assetId,
      address,
      amount: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        Number(amount)
      ).toString(),
    };
    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.withdrawSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.exchangeInbox.notifications.withdrawError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
