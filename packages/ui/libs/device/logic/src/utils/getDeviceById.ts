import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-react-query-client';
import { isEmpty } from 'lodash';

export const getDeviceById = (
  id: string,
  devices: Array<DeviceDTO>,
  issuerId: string
) => {
  return !isEmpty(devices)
    ? devices.find(
        (device) =>
          device?.externalDeviceIds.find((ids) => ids.type === issuerId).id ===
          id
      )
    : null;
};
