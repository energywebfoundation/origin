import { TradeDTO } from '@energyweb/exchange-irec-react-query-client';
import { TableRowData, TableComponentProps } from '@energyweb/origin-ui-core';
import { TFunction } from 'react-i18next';

export type TUseLogicMyTradesArgs = {
  trades: TradeDTO[];
  loading: boolean;
};

export type TFormatMyTradesData = (
  props: Omit<TUseLogicMyTradesArgs, 'loading'> & {
    t: TFunction<'translation'>;
  }
) => TableRowData<TradeDTO['id']>[];

export type TUseLogicMyTrades = (
  props: TUseLogicMyTradesArgs
) => TableComponentProps<TradeDTO['id']>;
