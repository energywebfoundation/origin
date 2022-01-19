import { TMenuSection } from '@energyweb/origin-ui-core';

export type TGetDeviceMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showAllDevices: boolean;
  showMapView: boolean;
  showMyDevices: boolean;
  showPendingDevices: boolean;
  showRegisterDevice: boolean;
  showDeviceImport: boolean;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
};

type TGetDeviceMenu = (args?: TGetDeviceMenuArgs) => TMenuSection;

export const getDeviceMenu: TGetDeviceMenu = ({
  t,
  isOpen,
  showSection,
  showAllDevices,
  showMapView,
  showMyDevices,
  showPendingDevices,
  showRegisterDevice,
  showDeviceImport,
  selectedMenuItemClass,
  menuButtonClass,
}) => {
  const menuList = [
    {
      url: 'all',
      label: t('navigation.device.all'),
      show: showAllDevices ?? true,
      dataCy: 'allDevices',
    },
    {
      url: 'map',
      label: t('navigation.device.map'),
      show: showMapView ?? true,
      dataCy: 'devicesMap',
    },
    {
      url: 'my',
      label: t('navigation.device.my'),
      show: showMyDevices,
      dataCy: 'myDevices',
    },
    {
      url: 'pending',
      label: t('navigation.device.pending'),
      show: showPendingDevices,
      dataCy: 'pendingDevices',
    },
    {
      url: 'register',
      label: t('navigation.device.register'),
      show: showRegisterDevice,
      dataCy: 'registerDevice',
    },
    {
      url: 'import',
      label: t('navigation.device.import'),
      show: showDeviceImport,
      dataCy: 'importDevice',
    },
  ];

  return {
    isOpen,
    dataCy: 'deviceMenu',
    sectionTitle: t('navigation.device.sectionTitle'),
    show: showSection,
    rootUrl: '/device',
    menuList,
    menuButtonClass,
    selectedMenuItemClass,
  };
};
