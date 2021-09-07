import { IrecDeviceDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { DeviceModalsActionsEnum } from './reducer';

export interface IDeviceModalsStore {
  importDevice: {
    open: boolean;
    deviceToImport: IrecDeviceDTO;
  };
}

export interface IShowImportDeviceAction {
  type: DeviceModalsActionsEnum.SHOW_IMPORT_DEVICE;
  payload: {
    open: boolean;
    deviceToImport: IrecDeviceDTO;
  };
}

export type TDeviceModalsAction = IShowImportDeviceAction;
