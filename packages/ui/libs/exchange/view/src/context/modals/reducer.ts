import { IExchangeModalsStore, TExchangeModalsAction } from './types';

export enum ExchangeModalsActionsEnum {
  SHOW_UPDATE_SUPPLY = 'SHOW_UPDATE_SUPPLY',
  SHOW_REMOVE_SUPPLY = 'SHOW_REMOVE_SUPPLY',
}

export const exchangeModalsInitialState: IExchangeModalsStore = {
  removeSupply: {
    open: false,
    supplyId: null,
  },
  updateSupply: {
    open: false,
    deviceWithSupply: null,
  },
};

export const exchangeModalsReducer = (
  state = exchangeModalsInitialState,
  action: TExchangeModalsAction
): IExchangeModalsStore => {
  switch (action.type) {
    case ExchangeModalsActionsEnum.SHOW_UPDATE_SUPPLY:
      return { ...state, updateSupply: action.payload };
    case ExchangeModalsActionsEnum.SHOW_REMOVE_SUPPLY:
      return { ...state, removeSupply: action.payload };
  }
};
