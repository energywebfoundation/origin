import { IDeviceWithSupply } from '@energyweb/origin-ui-exchange-logic';
import { ExchangeModalsActionsEnum } from './reducer';

export interface IExchangeModalsStore {
  removeSupply: {
    open: boolean;
    supplyId: string;
  };
  updateSupply: {
    open: boolean;
    deviceWithSupply: IDeviceWithSupply;
  };
}

interface IShowUpdateSupplyAction {
  type: ExchangeModalsActionsEnum.SHOW_UPDATE_SUPPLY;
  payload: {
    open: boolean;
    deviceWithSupply: IDeviceWithSupply;
  };
}

interface IShowRemoveSupplyAction {
  type: ExchangeModalsActionsEnum.SHOW_REMOVE_SUPPLY;
  payload: {
    open: boolean;
    supplyId: string;
  };
}

export type TExchangeModalsAction =
  | IShowUpdateSupplyAction
  | IShowRemoveSupplyAction;
