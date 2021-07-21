import { ISupplyUpdateModalStore, TSupplyUpdateModalAction } from './types';

export enum UpdateSupplyModalActionsEnum {
  SHOW_UPDATE_SUPPLY = 'SHOW_UPDATE_SUPPLY',
}

export const supplyUpdateModalInitialState: ISupplyUpdateModalStore = {
  updateSupply: {
    open: false,
    deviceWithSupply: null,
  },
};

export const supplyUpdateModalReducer = (
  state = supplyUpdateModalInitialState,
  action: TSupplyUpdateModalAction
): ISupplyUpdateModalStore => {
  switch (action.type) {
    case UpdateSupplyModalActionsEnum.SHOW_UPDATE_SUPPLY:
      return { ...state, updateSupply: action.payload };
  }
};
