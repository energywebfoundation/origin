import { getDeviceRegistryControllerGetAllQueryKey } from '@energyweb/origin-device-registry-api-react-query-client';
import {
  DeviceDTO,
  useDeviceControllerUpdateDeviceStatus,
  DeviceState,
  getDeviceControllerGetAllQueryKey,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  NotificationTypeEnum,
  showNotification,
} from '@energyweb/origin-ui-core';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';

export const useApiHandlersForPendingDevices = () => {
  const { mutate } = useDeviceControllerUpdateDeviceStatus();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const originDevicesQueryKey = getDeviceRegistryControllerGetAllQueryKey();
  const iRecDevicesQueryKey = getDeviceControllerGetAllQueryKey();

  const approveHandler = (id: DeviceDTO['id']) => {
    mutate(
      { id, data: { status: DeviceState.Approved } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(originDevicesQueryKey);
          queryClient.invalidateQueries(iRecDevicesQueryKey);
          showNotification(
            t('device.pending.notifications.approveSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: () => {
          showNotification(
            t('device.pending.notifications.approveError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  const rejectHandler = (id: DeviceDTO['id']) => {
    mutate(
      { id, data: { status: DeviceState.Rejected } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(originDevicesQueryKey);
          queryClient.invalidateQueries(iRecDevicesQueryKey);
          showNotification(
            t('device.pending.notifications.rejectSuccess'),
            NotificationTypeEnum.Success
          );
        },
        onError: () => {
          showNotification(
            t('device.pending.notifications.rejectError'),
            NotificationTypeEnum.Error
          );
        },
      }
    );
  };

  return { approveHandler, rejectHandler };
};
