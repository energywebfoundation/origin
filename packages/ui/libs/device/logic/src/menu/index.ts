import { TGetDeviceMenu } from './types';

export const getDeviceMenu: TGetDeviceMenu = ({
  t,
  showAllDevices,
  showMapView,
  showMyDevices,
  showPendingDevices,
  showRegisterDevice,
  showDeviceImport,
}) => {
  const menuList = [
    {
      url: 'all',
      label: t('navigation.device.all'),
      show: showAllDevices ?? true,
    },
    {
      url: 'map',
      label: t('navigation.device.map'),
      show: showMapView ?? true,
    },
    {
      url: 'my',
      label: t('navigation.device.my'),
      show: showMyDevices,
    },
    {
      url: 'pending',
      label: t('navigation.device.pending'),
      show: showPendingDevices,
    },
    {
      url: 'register',
      label: t('navigation.device.register'),
      show: showRegisterDevice,
    },
    {
      url: 'import',
      label: t('navigation.device.import'),
      show: showDeviceImport,
    },
    {
      url: 'detail-view-mock',
      label: 'Detail View Mock',
      show: true,
    },
  ];

  return {
    sectionTitle: t('navigation.device.sectionTitle'),
    show: true,
    rootUrl: '/device',
    menuList,
  };
};
