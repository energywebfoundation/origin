import { OriginEnvironment } from '@energyweb/origin-ui-shared-state';
import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';
import { isEmpty } from 'lodash';

export const getDeviceById = (
  id: string,
  devices: Array<DeviceDTO>,
  environment: OriginEnvironment
) => {
  return !isEmpty(devices)
    ? devices.find(
        (device) =>
          device?.externalDeviceIds.find(
            (ids) => ids.type === environment.ISSUER_ID
          ).id === id
      )
    : null;
};
