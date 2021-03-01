import { ICoreState } from '@energyweb/origin-ui-core';
import { IExchangeState } from '@energyweb/exchange-ui-core';

export interface IStoreState extends ICoreState, IExchangeState {}
