// import {
//   ComposedPublicDevice,
//   ComposedDevice,
// } from '@energyweb/origin-ui-device-data';
import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';

export type TPrepareDeviceSpecsForCardArgs = {
  t: (tag: string) => string;
  device: any; //ComposedPublicDevice | ComposedDevice;
};

export type PrepareDeviceSpecsForCardReturnType = {
  specsData: SpecFieldProps[];
  iconsData: IconTextProps[];
};

export type TPrepareDeviceSpecsForCard = (
  args: TPrepareDeviceSpecsForCardArgs
) => PrepareDeviceSpecsForCardReturnType;
