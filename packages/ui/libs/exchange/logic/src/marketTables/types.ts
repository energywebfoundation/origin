import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  CodeNameDTO,
  UserDTO,
} from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { TableComponentProps, TableRowData } from '@energyweb/origin-ui-core';
import { TFunction } from 'react-i18next';

// Sell offers table
export type TUseSellOffersTableArgs = {
  asks: OrderBookOrderDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
  className: string;
  user: UserDTO;
  onBuyClick: (id: OrderBookOrderDTO['id']) => void;
};
export type TFormatAsks = (
  props: Omit<TUseSellOffersTableArgs, 'isLoading' | 'className'> & {
    t: TFunction<'translation'>;
    primaryColor: string;
  }
) => TableRowData<OrderBookOrderDTO['id']>[];
export type TUseSellOffersTableLogic = (
  props: TUseSellOffersTableArgs
) => TableComponentProps<OrderBookOrderDTO['id']>;
// Sell offers table

// Buy offers table
export type TUseBuyOffersTableArgs = {
  bids: OrderBookOrderDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
  className: string;
  user: UserDTO;
};
export type TFormatBids = (
  props: Omit<TUseBuyOffersTableArgs, 'isLoading' | 'user' | 'className'>
) => TableRowData<OrderBookOrderDTO['id']>[];
export type TUseBuyOffersTableLogic = (
  props: TUseBuyOffersTableArgs
) => TableComponentProps<OrderBookOrderDTO['id']>;
// Buy offers tables

// Trading view
export type TUseAsksTableArgs = {
  asks: OrderBookOrderDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
  className: string;
  user: UserDTO;
};
export type TFormatAsksForTradingView = (
  props: Omit<TUseAsksTableArgs, 'isLoading' | 'user' | 'className'>
) => TableRowData<OrderBookOrderDTO['id']>[];
export type TUseAsksTableLogic = (
  props: TUseAsksTableArgs
) => TableComponentProps<OrderBookOrderDTO['id']>;

export type TUseBidsTableArgs = {
  bids: OrderBookOrderDTO[];
  allFuelTypes: CodeNameDTO[];
  isLoading: boolean;
  className: string;
  user: UserDTO;
};
export type TFormatBidsForTradingView = (
  props: Omit<TUseBidsTableArgs, 'isLoading' | 'user' | 'className'>
) => TableRowData<OrderBookOrderDTO['id']>[];
export type TUseBidsTableLogic = (
  props: TUseBidsTableArgs
) => TableComponentProps<OrderBookOrderDTO['id']>;
// Trading view
