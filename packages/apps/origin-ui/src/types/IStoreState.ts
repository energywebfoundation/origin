import { ICoreState } from '@energyweb/origin-ui-core';
import { IExchangeState } from '@energyweb/exchange-ui-core';
import { IIRecAppState } from '@energyweb/origin-ui-irec-core';

export interface IStoreState extends ICoreState, IExchangeState, IIRecAppState {}
