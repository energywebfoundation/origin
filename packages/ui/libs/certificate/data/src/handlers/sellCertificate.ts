import {
  CreateAskDTO,
  useOrderControllerCreateAsk,
} from '@energyweb/exchange-irec-react-query-client';
import {
  AccountAssetDTO,
  getAccountBalanceControllerGetQueryKey,
} from '@energyweb/exchange-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useSellCertificateHandler = (
  price: string,
  exchangeCertificates: AccountAssetDTO[],
  resetList: () => void,
  setTxPending: Dispatch<SetStateAction<boolean>>
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();
  const { mutate } = useOrderControllerCreateAsk();

  const sellHandler = <Id>(id: Id, amount: string) => {
    setTxPending(true);
    const assetId = exchangeCertificates.find(
      (cert) =>
        cert.asset.id === ((id as unknown) as AccountAssetDTO['asset']['id'])
    ).asset?.id;

    const data: CreateAskDTO = {
      volume: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        Number(amount)
      ).toString(),
      price: Math.round((Number(price) + Number.EPSILON) * 100),
      validFrom: dayjs().toISOString(),
      assetId,
    };
    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.sellSuccess'),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(exchangeCertificatesQueryKey);
          resetList();
        },
        onError: (error: any) => {
          showNotification(
            `${t('certificate.exchangeInbox.notifications.sellError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
        },
        onSettled: () => setTxPending(false),
      }
    );
  };

  return { sellHandler };
};
