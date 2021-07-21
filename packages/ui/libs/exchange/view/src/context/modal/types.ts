import { IDeviceWithSupply } from '@energyweb/origin-ui-exchange-logic';
import { UpdateSupplyModalActionsEnum } from './reducer';

export interface ISupplyUpdateModalStore {
  updateSupply: {
    open: boolean;
    deviceWithSupply: IDeviceWithSupply;
  };
}

interface IShowUpdateSupplyAction {
  type: UpdateSupplyModalActionsEnum.SHOW_UPDATE_SUPPLY;
  payload: {
    open: boolean;
    deviceWithSupply: IDeviceWithSupply;
  };
}

export type TSupplyUpdateModalAction = IShowUpdateSupplyAction;
