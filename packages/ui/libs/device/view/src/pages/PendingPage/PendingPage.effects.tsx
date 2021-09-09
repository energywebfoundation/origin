import React from 'react';
import {
  useAllDeviceFuelTypes,
  useAllDeviceTypes,
  useApiHandlersForPendingDevices,
  useApiPendingDevices,
} from '@energyweb/origin-ui-device-data';
import { useLogicPendingDevices } from '@energyweb/origin-ui-device-logic';
import { Check, Clear } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { TableActionData } from '@energyweb/origin-ui-core';
import { DeviceDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

export const usePendingPageEffects = () => {
  const { t } = useTranslation();
  const { allTypes: allFuelTypes, isLoading: isFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: isDeviceTypesloading } =
    useAllDeviceTypes();

  const { pendingDevices: devices, isLoading: areDevicesLoading } =
    useApiPendingDevices();
  const { approveHandler, rejectHandler, isMutating } =
    useApiHandlersForPendingDevices();

  const actions: TableActionData<DeviceDTO['id']>[] = [
    {
      icon: <Check />,
      name: t('device.pending.approve'),
      onClick: approveHandler,
      loading: isMutating,
    },
    {
      icon: <Clear />,
      name: t('device.pending.reject'),
      onClick: rejectHandler,
      loading: isMutating,
    },
  ];

  const loading =
    isFuelTypesLoading || isDeviceTypesloading || areDevicesLoading;

  const tableProps = useLogicPendingDevices({
    devices,
    loading,
    actions,
    allFuelTypes,
    allDeviceTypes,
  });

  return tableProps;
};
