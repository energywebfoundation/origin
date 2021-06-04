import { useTranslation } from 'react-i18next';

import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';
import {
  getAccountMenu,
  useTopbarButtonList,
} from '@energyweb/origin-ui-user-logic';
import { getAdminMenu } from '@energyweb/origin-ui-user-logic';

import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { useUser } from '@energyweb/origin-ui-user-data-access';

export const useAppContainerEffects = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useUser();

  const topbarButtons = useTopbarButtonList(isAuthenticated, logout);

  const userHasOrg = Boolean(user?.organization?.id);
  const userIsOrgAdmin = isRole(user, Role.OrganizationAdmin);
  const userIsActive = user && user.status === UserStatus.Active;
  const userIsAdminOrSupport = isRole(user, Role.Admin, Role.SupportAgent);

  const orgMenu = getOrganizationMenu({
    t,
    showRegisterOrg: !userHasOrg,
    showMyOrg: userHasOrg,
    showMembers: userHasOrg && userIsOrgAdmin,
    showInvitations: userHasOrg && userIsOrgAdmin ? true : false,
    showInvite: userIsActive && userHasOrg && userIsOrgAdmin,
    showAllOrgs: isAuthenticated && userIsActive && userIsAdminOrSupport,
    showRegisterIRec: true,
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
  const accountMenu = getAccountMenu({
    t,
    showSettings: true,
    showUserProfile: true,
  });
  const adminMenu = getAdminMenu({
    t,
    showClaims: true,
    showUsers: true,
  });

  const menuSections = [deviceMenu, orgMenu, accountMenu, adminMenu];

  return {
    topbarButtons,
    isAuthenticated,
    menuSections,
    user,
  };
};
