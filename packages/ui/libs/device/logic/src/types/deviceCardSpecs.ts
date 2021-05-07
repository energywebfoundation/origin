import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-react-query-client';
import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';

export type TPrepareDeviceSpecsForCardArgs = {
  t: (tag: string) => string;
  device: DeviceDTO;
};

export type PrepareDeviceSpecsForCardReturnType = {
  specsData: SpecFieldProps[];
  iconsData: IconTextProps[];
};

export type TPrepareDeviceSpecsForCard = (
  args: TPrepareDeviceSpecsForCardArgs
) => PrepareDeviceSpecsForCardReturnType;
