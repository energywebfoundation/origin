import {
  DeviceDTO,
  UpdateDeviceDTO,
  useDeviceControllerUpdateDevice,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedPublicDevice } from '../types';

export const useApiHandlersForPendingDevices = (
  pendingDevices: ComposedPublicDevice[]
) => {
  const { mutate } = useDeviceControllerUpdateDevice();

  const getRequestData = (
    device: Omit<UpdateDeviceDTO, 'active'>,
    active: boolean
  ): UpdateDeviceDTO => ({
    name: device.name,
    deviceType: device.deviceType,
    fuelType: device.fuelType,
    countryCode: device.countryCode,
    capacity: device.capacity,
    commissioningDate: device.commissioningDate,
    registrationDate: device.registrationDate,
    address: device.address,
    latitude: device.latitude,
    longitude: device.longitude,
    notes: device.notes,
    active,
  });

  const approveHandler = (id: DeviceDTO['id']) => {
    const deviceToUpdate = pendingDevices?.find(
      (device) => device.externalRegistryId === id
    );
    const data = deviceToUpdate && getRequestData(deviceToUpdate, true);
    mutate({ id, data });
  };

  const rejectHandler = (id: DeviceDTO['id']) => {
    const deviceToUpdate = pendingDevices?.find(
      (device) => device.externalRegistryId === id
    );
    const data = deviceToUpdate && getRequestData(deviceToUpdate, false);
    mutate({ id, data });
  };

  return { approveHandler, rejectHandler };
};
