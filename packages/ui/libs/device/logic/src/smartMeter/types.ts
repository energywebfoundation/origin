import { ReadDTO } from '@energyweb/origin-energy-api-react-query-client';
import { TableComponentProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';

export type TUseSmartMeterTableArgs = {
  device: ComposedPublicDevice;
  reads: ReadDTO[];
  loading: boolean;
};

export type TUseSmartMeterTableLogic = (
  args: TUseSmartMeterTableArgs
) => TableComponentProps<ReadDTO['timestamp']>;
