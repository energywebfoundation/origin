import {
  useOrderControllerDirectBuy,
  DirectBuyDTO,
  OrderBookOrderDTO,
} from '@energyweb/exchange-irec-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';

export type BuyDirectFormValues = {
  volume: string;
};

export const useApiBuyDirectHandler = (
  askId: OrderBookOrderDTO['id'],
  price: OrderBookOrderDTO['price'],
  closeModal: () => void
) => {
  const { t } = useTranslation();
  const { mutate } = useOrderControllerDirectBuy();

  return (values: BuyDirectFormValues) => {
    const data: DirectBuyDTO = {
      askId,
      price,
      volume: PowerFormatter.getBaseValueFromValueInDisplayUnit(
        parseInt(values.volume)
      ).toString(),
    };

    mutate(
      { data },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.viewMarket.notifications.buyDirectSuccess'),
            NotificationTypeEnum.Success
          );
          closeModal();
        },
        onError: (error: any) => {
          showNotification(
            `${t('exchange.viewMarket.notifications.buyDirectError')}:
            ${error?.response?.data?.message || ''}
            `,
            NotificationTypeEnum.Error
          );
          closeModal();
        },
      }
    );
  };
};
