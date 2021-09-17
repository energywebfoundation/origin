import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  TableActionData,
  TableComponentProps,
  TableRowData,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-device-data';

export type TUseLogicPendingDevicesArgs = {
  devices: ComposedPublicDevice[];
  actions: TableActionData<ComposedPublicDevice['id']>[];
  loading: boolean;
  allFuelTypes: CodeNameDTO[];
  allDeviceTypes: CodeNameDTO[];
};

export type TFormatDevicesData = (
  props: Omit<TUseLogicPendingDevicesArgs, 'loading'>
) => TableRowData<ComposedPublicDevice['id']>[];

export type TUseLogicPendingDevices = (
  props: TUseLogicPendingDevicesArgs
) => TableComponentProps<ComposedPublicDevice['id']>;
