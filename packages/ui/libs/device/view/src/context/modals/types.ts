import { IrecDeviceDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  ComposedPublicDevice,
  EditDeviceFormValues,
} from '@energyweb/origin-ui-device-data';
import { DeviceModalsActionsEnum } from './reducer';

export interface IDeviceModalsStore {
  importDevice: {
    open: boolean;
    deviceToImport: IrecDeviceDTO;
  };
  confirmEdit: {
    open: boolean;
    editData: EditDeviceFormValues;
    device: ComposedPublicDevice;
  };
}

export interface IShowImportDeviceAction {
  type: DeviceModalsActionsEnum.SHOW_IMPORT_DEVICE;
  payload: {
    open: boolean;
    deviceToImport: IrecDeviceDTO;
  };
}

export interface IShowConfirmEditAction {
  type: DeviceModalsActionsEnum.SHOW_CONFIRM_EDIT;
  payload: {
    open: boolean;
    editData: EditDeviceFormValues | null;
    device: ComposedPublicDevice | null;
  };
}

export type TDeviceModalsAction =
  | IShowImportDeviceAction
  | IShowConfirmEditAction;
