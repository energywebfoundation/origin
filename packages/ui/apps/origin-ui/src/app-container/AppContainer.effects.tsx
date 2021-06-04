import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';
import { getAccountMenu } from '@energyweb/origin-ui-user-logic';
import { getAdminMenu } from '@energyweb/origin-ui-user-logic';

import {
  useAuthDispatchLogoutUser,
  useAuthIsAuthenticated,
} from '@energyweb/origin-ui-react-query-providers';
import { useAccount } from '@energyweb/origin-ui-user-view';
import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { useAxiosInterceptors } from '@energyweb/origin-ui-react-query-providers';

export const useAppContainerEffects = () => {
  useAxiosInterceptors();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const logoutUser = useAuthDispatchLogoutUser();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isAuthenticated = useAuthIsAuthenticated();

  const accountData = useAccount();
  const user = accountData?.userAccountData;
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

  const menuSections = [orgMenu, deviceMenu, accountMenu, adminMenu];

  return {
    handleLogout,
    isAuthenticated,
    menuSections,
    accountData,
  };
};
