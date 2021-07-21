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

  const { mutate } = useSupplyControllerRemove({
    onSuccess: () => {
      showNotification(
        t('exchange.supply.notifications.removeSupplySuccess'),
        NotificationTypeEnum.Success
      );
      queryClient.invalidateQueries(allSupplyQueryKey);
    },
    onError: (error) => {
      console.log(error);
      showNotification(
        t('exchange.supply.notifications.removeSupplyError'),
        NotificationTypeEnum.Error
      );
    },
  });

  const removeSupplyHandler = (id: IDeviceWithSupply['supplyId']) => {
    if (id) {
      mutate({ id });
    } else {
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
