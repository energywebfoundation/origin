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
import { IDeviceWithSupply } from '@energyweb/origin-ui-exchange-logic';

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
          onError: (error) => {
            console.log(error);
            showNotification(
              t('exchange.supply.notifications.removeSupplyError'),
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