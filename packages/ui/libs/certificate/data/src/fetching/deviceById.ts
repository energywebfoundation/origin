import { OriginDeviceDTO } from '@energyweb/origin-device-registry-api-react-query-client';
import { ComposedPublicDevice } from '../types';
import { useApiAllDevices } from './allDevices';

export const useDeviceByExternalRegistryId = (
  id: OriginDeviceDTO['externalRegistryId']
) => {
  const { allDevices, isLoading } = useApiAllDevices();

  const device: ComposedPublicDevice = !!id
    ? allDevices?.find((device) => device.externalRegistryId === id)
    : null;

  return { device, isLoading };
};
