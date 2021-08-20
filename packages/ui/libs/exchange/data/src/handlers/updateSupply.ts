import { UseFormReset } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  useSupplyControllerCreate,
  useSupplyControllerUpdate,
  getSupplyControllerFindAllQueryKey,
} from '@energyweb/exchange-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import {
  IDeviceWithSupply,
  TUpdateSupplyFormValues,
  SupplyStatus,
} from '../types';

export const useApiUpdateSupplyHandler = (
  deviceWithSupply: IDeviceWithSupply,
  handleModalClose: () => void
) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const allSupplyQueryKey = getSupplyControllerFindAllQueryKey();

  const { mutate: createSupply } = useSupplyControllerCreate();
  const { mutate: updateSupply } = useSupplyControllerUpdate();

  const submitHandler = (
    values: TUpdateSupplyFormValues,
    reset: UseFormReset<TUpdateSupplyFormValues>
  ) => {
    if (deviceWithSupply?.supplyId) {
      updateSupply(
        {
          id: deviceWithSupply.supplyId,
          data: {
            active: values.status === SupplyStatus.Active,
            price: values.price,
          },
        },
        {
          onSuccess: () => {
            showNotification(
              t('exchange.supply.notifications.updateSupplySuccess'),
              NotificationTypeEnum.Success
            );
            queryClient.invalidateQueries(allSupplyQueryKey);
            reset();
            handleModalClose();
          },
          onError: (error: any) => {
            showNotification(
              `${t('exchange.supply.notifications.updateSupplyError')}:
              ${error?.response?.data?.message || ''}
              `,
              NotificationTypeEnum.Error
            );
          },
        }
      );
    } else {
      createSupply(
        {
          data: {
            deviceId: deviceWithSupply?.deviceId,
            price: values.price,
            active: values.status === SupplyStatus.Active,
          },
        },
        {
          onSuccess: () => {
            showNotification(
              t('exchange.supply.notifications.createSupplySuccess'),
              NotificationTypeEnum.Success
            );
            queryClient.invalidateQueries(allSupplyQueryKey);
            reset();
            handleModalClose();
          },
          onError: (error: any) => {
            showNotification(
              `${t('exchange.supply.notifications.createSupplyError')}:
              ${error?.response?.data?.message || ''}
              `,
              NotificationTypeEnum.Error
            );
          },
        }
      );
    }
  };

  return submitHandler;
};
