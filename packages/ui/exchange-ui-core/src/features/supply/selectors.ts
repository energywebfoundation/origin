import { SupplyDto } from '@energyweb/exchange-client';
import { IExchangeState } from '../../types';

export const getSupplies = (state: IExchangeState): SupplyDto[] => state.supplyState.supplies;
