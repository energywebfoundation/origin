import { IDeviceModalsStore, TDeviceModalsAction } from './types';

export enum DeviceModalsActionsEnum {
  SHOW_IMPORT_DEVICE = 'SHOW_IMPORT_DEVICE',
  SHOW_CONFIRM_EDIT = 'SHOW_CONFIRM_EDIT',
}

export const deviceModalsInitialState: IDeviceModalsStore = {
  importDevice: {
    open: false,
    deviceToImport: null,
  },
  confirmEdit: {
    open: false,
    editData: null,
    device: null,
  },
};

export const deviceModalsReducer = (
  state = deviceModalsInitialState,
  action: TDeviceModalsAction
): IDeviceModalsStore => {
  switch (action.type) {
    case DeviceModalsActionsEnum.SHOW_IMPORT_DEVICE:
      return { ...state, importDevice: action.payload };
    case DeviceModalsActionsEnum.SHOW_CONFIRM_EDIT:
      return { ...state, confirmEdit: action.payload };
  }
};
