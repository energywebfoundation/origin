import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';

type TUseDeviceDetailViewLogicArgs = {
  device: ComposedPublicDevice;
  owner: string;
  allTypes: CodeNameDTO[];
  certifiedAmount: string;
};

type TUseDeviceDetailViewLogicReturnType = {
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

export type TUseDeviceDetailViewLogic = (
  args: TUseDeviceDetailViewLogicArgs
) => TUseDeviceDetailViewLogicReturnType;
