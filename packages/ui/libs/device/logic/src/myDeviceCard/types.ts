import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  FallbackIconProps,
  IconTextProps,
  SpecFieldProps,
} from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-device-data';

type TUseSpecsForMyDeviceCardArgs = {
  device: ComposedDevice;
  allTypes: CodeNameDTO[];
  imageUrl: string;
};

export type TUseSpecsForMyDeviceCardReturnType = {
  imageUrl: string;
  fallbackIcon: FallbackIconProps['icon'];
  cardHeaderProps: {
    deviceName: string;
    buttonText: string;
    buttonLink: string;
    specFieldProps: SpecFieldProps;
  };
  cardContentProps: {
    iconsProps: IconTextProps[];
  };
};

export type TUseSpecsForMyDeviceCard = (
  args: TUseSpecsForMyDeviceCardArgs
) => TUseSpecsForMyDeviceCardReturnType;
