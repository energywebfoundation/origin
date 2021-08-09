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

export const usePendingPageEffects = () => {
  const { t } = useTranslation();
  const { allTypes: allFuelTypes, isLoading: isFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: isDeviceTypesloading } =
    useAllDeviceTypes();

  const { pendingDevices: devices, isLoading: areDevicesLoading } =
    useApiPendingDevices();
  const { approveHandler, rejectHandler } = useApiHandlersForPendingDevices();

  const actions = [
    {
      icon: <Check />,
      name: t('device.pending.approve'),
      onClick: approveHandler,
    },
    {
      icon: <Clear />,
      name: t('device.pending.reject'),
      onClick: rejectHandler,
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
