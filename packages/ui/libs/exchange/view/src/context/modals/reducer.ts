import { IExchangeModalsStore, TExchangeModalsAction } from './types';

export enum ExchangeModalsActionsEnum {
  SHOW_BUNDLE_DETAILS = 'SHOW_BUNDLE_DETAILS',
}

export const exchangeModalsInitialState: IExchangeModalsStore = {
  bundleDetails: {
    open: false,
    bundle: null,
    isOwner: false,
  },
};

export const exchangeModalsReducer = (
  state = exchangeModalsInitialState,
  action: TExchangeModalsAction
): IExchangeModalsStore => {
  switch (action.type) {
    case ExchangeModalsActionsEnum.SHOW_BUNDLE_DETAILS:
      return { ...state, bundleDetails: action.payload };
  }
};
