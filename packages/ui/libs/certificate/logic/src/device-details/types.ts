import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-certificate-data';

type TUseDeviceDetailsLogicArgs = {
  device: ComposedPublicDevice;
  owner: string;
  allTypes: CodeNameDTO[];
  certifiedAmount: string;
};

type TUseDeviceDetailsLogicReturnType = {
  locationProps: {
    owner: string;
    location: string;
    coordinates: string;
  };
  cardProps: {
    headingIconProps: IconTextProps;
    specFields: SpecFieldProps[];
  };
};

export type TUseDeviceDetailsLogic = (
  args: TUseDeviceDetailsLogicArgs
) => TUseDeviceDetailsLogicReturnType;
