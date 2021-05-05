import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';
import { useTranslation } from 'react-i18next';

export const useAppEffects = () => {
  const { t } = useTranslation();

  const orgMenu = getOrganizationMenu({
    t,
    isLoggedIn: true,
    userHasOrg: true,
    userIsAdminOrSupport: false,
    userIsOrgAdmin: true,
    userIsActive: true,
    userOrgHasIRec: false,
    invitationsExist: true,
  });

  const deviceMenu = getDeviceMenu({
    t,
    showAllDevices: true,
    showMapView: true,
    showMyDevices: true,
    showPendingDevices: true,
    showRegisterDevice: true,
    showDeviceImport: true,
  });

  const menuSections = [orgMenu, deviceMenu];
  return { menuSections };
};
