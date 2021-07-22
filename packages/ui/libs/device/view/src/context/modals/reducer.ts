import { IDeviceModalsStore, TDeviceModalsAction } from './types';

export enum DeviceModalsActionsEnum {
  SHOW_IMPORT_DEVICE = 'SHOW_IMPORT_DEVICE',
}

export const deviceModalsInitialState: IDeviceModalsStore = {
  importDevice: {
    open: false,
    deviceToImport: null,
  },
};

export const deviceModalsReducer = (
  state = deviceModalsInitialState,
  action: TDeviceModalsAction
): IDeviceModalsStore => {
  switch (action.type) {
    case DeviceModalsActionsEnum.SHOW_IMPORT_DEVICE:
      return { ...state, importDevice: action.payload };
  }
};
