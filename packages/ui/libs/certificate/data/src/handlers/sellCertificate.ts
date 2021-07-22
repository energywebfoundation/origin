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
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useSellCertificateHandler = (
  price: string,
  exchangeCertificates: AccountAssetDTO[],
  resetList: () => void
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const exchangeCertificatesQueryKey = getAccountBalanceControllerGetQueryKey();
  const { mutate } = useOrderControllerCreateAsk();

  return <Id>(id: Id, amount: string) => {
    const assetId = exchangeCertificates.find(
      (cert) =>
        cert.asset.id === (id as unknown as AccountAssetDTO['asset']['id'])
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
        onError: () => {
          showNotification(
            t('certificate.exchangeInbox.notifications.sellError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };
};
