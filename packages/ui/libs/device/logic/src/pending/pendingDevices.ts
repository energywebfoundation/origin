import { PowerFormatter } from '@energyweb/origin-ui-utils';
import { useTranslation } from 'react-i18next';
import { TFormatDevicesData, TUseLogicPendingDevices } from './types';

const formatDevicesData: TFormatDevicesData = ({
  devices,
  actions,
  allFuelTypes,
  allDeviceTypes,
}) => {
  return devices.map((device) => ({
    id: device.externalRegistryId,
    owner: device.owner,
    facilityName: device.name,
    location: device.address,
    gridOperator: device.gridOperator,
    fuelType:
      allFuelTypes?.find((type) => type.code === device.fuelType).name || '',
    deviceType:
      allDeviceTypes?.find((type) => type.code === device.deviceType).name ||
      '',
    capacity: PowerFormatter.format(device.capacity),
    status: device.status,
    certified: 0,
    toBeCertified: 0,
    actions,
  }));
};

export const useLogicPendingDevices: TUseLogicPendingDevices = ({
  devices,
  actions,
  loading,
  allFuelTypes,
  allDeviceTypes,
}) => {
  const { t } = useTranslation();
  return {
    tableTitle: t('device.pending.tableTitle'),
    header: {
      owner: t('device.pending.owner'),
      facilityName: t('device.pending.facilityName'),
      location: t('device.pending.location'),
      gridOperator: t('device.pending.gridOperator'),
      fuelType: t('device.pending.fuelType'),
      deviceType: t('device.pending.deviceType'),
      capacity: t('device.pending.nameplateCapacity'),
      status: t('device.pending.status'),
      certified: t('device.pending.certifiedFor', {
        yearToDisplay: '2020/2021',
      }),
      toBeCertified: t('device.pending.toBeCertifiedFor', {
        yearToDisplay: '2020/2021',
      }),
      actions: '',
    },
    pageSize: 10,
    loading: loading,
    data: formatDevicesData({ devices, actions, allFuelTypes, allDeviceTypes }),
  };
};
