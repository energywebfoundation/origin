import {
  DemandDTO,
  OrderDTO,
} from '@energyweb/exchange-irec-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { TableComponentProps, TableRowData } from '@energyweb/origin-ui-core';
import { ComposedDevice } from '@energyweb/origin-ui-exchange-data';

export type TUseDemandsTableArgs = {
  demands: DemandDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
};
export type TFormatDemands = (
  props: Omit<TUseDemandsTableArgs, 'isLoading'>
) => TableRowData<DemandDTO['id']>[];
export type TUseDemandsTableLogic = (
  props: TUseDemandsTableArgs
) => TableComponentProps<DemandDTO['id']>;

export type TUseBidsTableArgs = {
  bids: OrderDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
};
export type TFormatBids = (
  props: Omit<TUseBidsTableArgs, 'isLoading'>
) => TableRowData<OrderDTO['id']>[];
export type TUseBidsTableLogic = (
  props: TUseBidsTableArgs
) => TableComponentProps<OrderDTO['id']>;

export type TUseAsksTableArgs = {
  asks: OrderDTO[];
  myDevices: ComposedDevice[];
  isLoading: boolean;
};
export type TFormatAsks = (
  props: Omit<TUseAsksTableArgs, 'isLoading'>
) => TableRowData<OrderDTO['id']>[];
export type TUseAsksTableLogic = (
  props: TUseAsksTableArgs
) => TableComponentProps<OrderDTO['id']>;
