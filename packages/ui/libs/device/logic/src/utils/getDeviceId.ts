import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-react-query-client';
import { OriginEnvironment } from '@energyweb/origin-ui-shared-state';

export const getDeviceId = (
  device: DeviceDTO,
  environment: OriginEnvironment
) =>
  device.externalDeviceIds?.find((i) => i.type === environment.ISSUER_ID)?.id ??
  String(device.id);
