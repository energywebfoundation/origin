import { useTranslation } from 'react-i18next';

import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';
import {
  getAccountMenu,
  useTopbarButtonList,
} from '@energyweb/origin-ui-user-logic';
import { getAdminMenu } from '@energyweb/origin-ui-user-logic';

import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { useUser } from '@energyweb/origin-ui-user-data';
import { useActiveMenuTab } from '../components';
import { getExchangeMenu } from '../../../../libs/exchange/logic/src/lib/menu/getExchangeMenu';

export const useAppContainerEffects = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useUser();

  const topbarButtons = useTopbarButtonList(isAuthenticated, logout);
  const {
    isOrganizationTabActive,
    isDeviceTabActive,
    isAccountTabActive,
    isAdminTabAcive,
  } = useActiveMenuTab();

  const userHasOrg = Boolean(user?.organization?.id);
  const userIsOrgAdmin = isRole(user, Role.OrganizationAdmin);
  const userIsActive = user && user.status === UserStatus.Active;
  const userIsAdminOrSupport = isRole(user, Role.Admin, Role.SupportAgent);
  const userIsOrgAdminOrAdminOrSupport = isRole(
    user,
    Role.OrganizationAdmin,
    Role.Admin,
    Role.SupportAgent
  );

  const orgMenu = getOrganizationMenu({
    t,
    isOpen: isOrganizationTabActive,
    showSection: userIsOrgAdminOrAdminOrSupport,
    showRegisterOrg: !userHasOrg,
    showMyOrg: userHasOrg,
    showMembers: userHasOrg && userIsOrgAdmin,
    showInvitations: userHasOrg && userIsOrgAdmin,
    showInvite: userIsActive && userHasOrg && userIsOrgAdmin,
    showAllOrgs: isAuthenticated && userIsActive && userIsAdminOrSupport,
    showRegisterIRec: true,
  });
  const deviceMenu = getDeviceMenu({
    t,
    isOpen: isDeviceTabActive,
    showSection: true,
    showAllDevices: true,
    showMapView: true,
    showMyDevices: true,
    showPendingDevices: true,
    showRegisterDevice: true,
    showDeviceImport: true,
  });
  const accountMenu = getAccountMenu({
    t,
    isOpen: isAccountTabActive,
    showSection: true,
    showSettings: true,
    showUserProfile: isAuthenticated,
  });
  const adminMenu = getAdminMenu({
    t,
    isOpen: isAdminTabAcive,
    showSection: userIsAdminOrSupport,
    showClaims: true,
    showUsers: true,
  });

  const exchangeMenu = getExchangeMenu({ t });

  const menuSections = [
    deviceMenu,
    orgMenu,
    accountMenu,
    exchangeMenu,
    adminMenu,
  ];

  return {
    topbarButtons,
    isAuthenticated,
    menuSections,
    user,
  };
};
