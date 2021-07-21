import { SupplyDto } from '@energyweb/exchange-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  TableRowData,
  TableComponentProps,
  TableActionData,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';

export type TUseLogicSupplyArgs = {
  devices: ComposedPublicDevice[];
  supplies: SupplyDto[];
  allFuelTypes: CodeNameDTO[];
  actions: TableActionData<ComposedPublicDevice['externalRegistryId']>[];
  loading: boolean;
};

export type TFormatSupplyReturnData = TableRowData<
  ComposedPublicDevice['externalRegistryId']
>[];

export type TFormatSupplyData = (
  props: Omit<TUseLogicSupplyArgs, 'loading'>
) => TFormatSupplyReturnData;

export type TUseLogicSupply = (
  props: TUseLogicSupplyArgs
) => TableComponentProps<ComposedPublicDevice['externalRegistryId']>;

export type IDeviceWithSupply = {
  deviceId: string;
  facilityName: string;
  fuelType: string;
  price: number;
  active?: boolean;
  supplyId?: string;
};

export type TCreateDeviceWithSupply = {
  device: ComposedPublicDevice;
  supplies: SupplyDto[];
  allFuelTypes: CodeNameDTO[];
};
