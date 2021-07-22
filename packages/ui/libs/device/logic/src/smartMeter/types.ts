import {
  AggregatedReadDTO,
  ReadDTO,
} from '@energyweb/origin-energy-api-react-query-client';
import { TableComponentProps } from '@energyweb/origin-ui-core';
import {
  ComposedPublicDevice,
  ReadingsWindowEnum,
} from '@energyweb/origin-ui-device-data';

export type TUseSmartMeterTableArgs = {
  device: ComposedPublicDevice;
  reads: ReadDTO[];
  loading: boolean;
};

export type TUseSmartMeterTableLogic = (
  args: TUseSmartMeterTableArgs
) => TableComponentProps<ReadDTO['timestamp']>;

export type TUseSmartMeterChartSelectorsArgs = {
  startDate: Date;
  endDate: Date;
  selectedWindow: ReadingsWindowEnum;
};

export type TSetDateBasedOnWindowArgs = {
  window: ReadingsWindowEnum;
  setStartDate: (value: Date) => void;
  setEndDate: (value: Date) => void;
};

export type TInterval = {
  label: string;
  multiplier: number;
  format: string;
};

export type TIntervalData = {
  [key: string]: TInterval;
};

export type TUseChartDataLogicArgs = {
  reads: AggregatedReadDTO[];
  startDate: Date;
  endDate: Date;
  window: ReadingsWindowEnum;
};

export type TUseGenerateChartLabelsArgs = {
  start: Date;
  end: Date;
  multiplier: number;
  format: string;
};
