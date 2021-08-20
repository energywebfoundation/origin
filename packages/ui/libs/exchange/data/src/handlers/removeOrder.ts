import {
  getOrderControllerGetMyOrdersQueryKey,
  OrderDTO,
  useOrderControllerCancelOrder,
} from '@energyweb/exchange-irec-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiCancelOrderHandler = (orderSide: string) => {
  const { mutate } = useOrderControllerCancelOrder();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const ordersQueryKey = getOrderControllerGetMyOrdersQueryKey();

  return (id: OrderDTO['id'], closeModal: () => void) => {
    mutate(
      { id },
      {
        onSuccess: () => {
          showNotification(
            t('exchange.myOrders.notifications.orderRemoveSuccess', {
              orderSide,
            }),
            NotificationTypeEnum.Success
          );
          queryClient.invalidateQueries(ordersQueryKey);
          closeModal();
        },
        onError: (error: any) => {
          showNotification(
            `${t('exchange.myOrders.notifications.orderRemoveError')}:
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
