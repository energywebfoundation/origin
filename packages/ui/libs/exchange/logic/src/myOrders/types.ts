import {
  DemandDTO,
  OrderDTO,
} from '@energyweb/exchange-irec-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  TableActionData,
  TableComponentProps,
  TableFilter,
  TableRowData,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';

export type TUseDemandsTableArgs = {
  demands: DemandDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
  actions: TableActionData<DemandDTO['id']>[];
  tableFilters: TableFilter[];
  openUpdateModal: (id: DemandDTO['id']) => void;
};
export type TFormatDemands = (
  props: Omit<
    TUseDemandsTableArgs,
    'isLoading' | 'openUpdateModal' | 'tableFilters'
  >
) => TableRowData<DemandDTO['id']>[];
export type TUseDemandsTableLogic = (
  props: TUseDemandsTableArgs
) => TableComponentProps<DemandDTO['id']>;

export type TUseBidsTableArgs = {
  bids: OrderDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
  actions: TableActionData<OrderDTO['id']>[];
  tableFilters: TableFilter[];
  openDetailsModal: (id: OrderDTO['id']) => void;
};
export type TFormatBids = (
  props: Omit<
    TUseBidsTableArgs,
    'isLoading' | 'openDetailsModal' | 'tableFilters'
  >
) => TableRowData<OrderDTO['id']>[];
export type TUseBidsTableLogic = (
  props: TUseBidsTableArgs
) => TableComponentProps<OrderDTO['id']>;

export type TUseAsksTableArgs = {
  asks: OrderDTO[];
  allDevices: ComposedPublicDevice[];
  isLoading: boolean;
  actions: TableActionData<OrderDTO['id']>[];
  tableFilters: TableFilter[];
  openDetailsModal: (id: OrderDTO['id']) => void;
};
export type TFormatAsks = (
  props: Omit<
    TUseAsksTableArgs,
    'isLoading' | 'openDetailsModal' | 'tableFilters'
  >
) => TableRowData<OrderDTO['id']>[];
export type TUseAsksTableLogic = (
  props: TUseAsksTableArgs
) => TableComponentProps<OrderDTO['id']>;
