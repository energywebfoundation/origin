import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  CardWithImageProps,
  IconTextProps,
  SpecFieldProps,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';

type TUseSpecsForAllDeviceCardArgs = {
  device: ComposedPublicDevice;
  allTypes: CodeNameDTO[];
  clickHandler: (link: string) => void;
};

type TUseSpecsForAllDeviceCardReturnType = {
  specsData: SpecFieldProps[];
  iconsData: IconTextProps[];
  cardProps: Omit<CardWithImageProps, 'content'>;
};

export type TUseSpecsForAllDeviceCard = (
  args: TUseSpecsForAllDeviceCardArgs
) => TUseSpecsForAllDeviceCardReturnType;
