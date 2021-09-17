import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import {
  useSupplyControllerRemove,
  getSupplyControllerFindAllQueryKey,
} from '@energyweb/exchange-react-query-client';
import { IDeviceWithSupply } from '../types';

export const useApiRemoveSupplyHandler = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const allSupplyQueryKey = getSupplyControllerFindAllQueryKey();

  const { mutate } = useSupplyControllerRemove();

  const removeSupplyHandler = (
    id: IDeviceWithSupply['supplyId'],
    closeModal: () => void
  ) => {
    if (id) {
      mutate(
        { id },
        {
          onSuccess: () => {
            showNotification(
              t('exchange.supply.notifications.removeSupplySuccess'),
              NotificationTypeEnum.Success
            );
            queryClient.invalidateQueries(allSupplyQueryKey);
            closeModal();
          },
          onError: (error: any) => {
            showNotification(
              `${t('exchange.supply.notifications.removeSupplyError')}:
              ${error?.response?.data?.message || ''}
              `,
              NotificationTypeEnum.Error
            );
          },
        }
      );
    } else {
      closeModal();
      showNotification(
        t('exchange.supply.notifications.missingSupplyError'),
        NotificationTypeEnum.Error
      );
    }
  };

  return {
    removeSupplyHandler,
  };
};
