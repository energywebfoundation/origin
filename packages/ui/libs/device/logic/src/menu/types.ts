import { TMenuSection } from '@energyweb/origin-ui-core';

type TGetDeviceMenuArgs = {
  t: (tag: string) => string;
  showAllDevices: boolean;
  showMapView: boolean;
  showMyDevices: boolean;
  showPendingDevices: boolean;
  showRegisterDevice: boolean;
  showDeviceImport: boolean;
};

export type TGetDeviceMenu = (
  args?: TGetDeviceMenuArgs
) => Omit<TMenuSection, 'isOpen'>;
