import { useTranslation } from 'react-i18next';

import { getOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getDeviceMenu } from '@energyweb/origin-ui-device-logic';
import { getExchangeMenu } from '@energyweb/origin-ui-exchange-logic';
import { getCertificateMenu } from '@energyweb/origin-ui-certificate-logic';
import {
  getAccountMenu,
  getAdminMenu,
  useTopbarButtonList,
} from '@energyweb/origin-ui-user-logic';

import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { useUser } from '@energyweb/origin-ui-user-data';
import { useActiveMenuTab } from '../components';
import { useAxiosInterceptors } from '@energyweb/origin-ui-react-query-providers';
import { useInvitationControllerGetInvitations } from '@energyweb/origin-organization-irec-api-react-query-client';

export const useAppContainerEffects = () => {
  useAxiosInterceptors();

  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useUser();

  const topbarButtons = useTopbarButtonList(isAuthenticated, logout);
  const {
    isOrganizationTabActive,
    isDeviceTabActive,
    isAccountTabActive,
    isAdminTabAcive,
    isExchangeTabActive,
    isCertificateTabActive,
  } = useActiveMenuTab();
  const { data: userInvitations } = useInvitationControllerGetInvitations({
    enabled: isAuthenticated,
  });
  const userHasOrg = Boolean(user?.organization?.id);
  const userIsOrgAdmin = isRole(user, Role.OrganizationAdmin);
  const userIsDeviceManagerOrAdmin = isRole(
    user,
    Role.OrganizationDeviceManager,
    Role.OrganizationAdmin
  );
  const userIsActive = user && user.status === UserStatus.Active;
  const userIsIssuer = isRole(user, Role.Issuer);
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
    showInvitations:
      userHasOrg && userIsOrgAdmin
        ? true
        : !!userInvitations && userInvitations.length > 0,
    showInvite: userIsActive && userHasOrg && userIsOrgAdmin,
    showAllOrgs: isAuthenticated && userIsActive && userIsAdminOrSupport,
    showRegisterIRec: true,
    showCreateBeneficiary: userHasOrg && userIsOrgAdmin,
  });
  const deviceMenu = getDeviceMenu({
    t,
    isOpen: isDeviceTabActive,
    showSection: true,
    showAllDevices: true,
    showMapView: true,
    showMyDevices: userIsDeviceManagerOrAdmin,
    showPendingDevices: userIsIssuer,
    showRegisterDevice: userIsDeviceManagerOrAdmin,
    showDeviceImport: userIsDeviceManagerOrAdmin,
  });
  const certificateMenu = getCertificateMenu({
    t,
    isOpen: isCertificateTabActive,
    showSection: (userIsActive && userHasOrg) || userIsIssuer,
    showExchangeInbox: userIsActive && userHasOrg && !userIsIssuer,
    showBlockchainInbox: userIsActive && userHasOrg && !userIsIssuer,
    showClaimsReport: userIsActive && userHasOrg && !userIsIssuer,
    showRequests: userIsActive && userHasOrg && !userIsIssuer,
    showPending: userIsIssuer,
  });
  const exchangeMenu = getExchangeMenu({
    t,
    isOpen: isExchangeTabActive,
    showSection: true,
    showViewMarket: true,
    showAllBundles: true,
    showCreateBundle: true,
    showMyTrades: true,
    showSupply: true,
    showMyBundles: true,
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

  const menuSections = [
    deviceMenu,
    certificateMenu,
    exchangeMenu,
    orgMenu,
    accountMenu,
    adminMenu,
  ];

  return {
    topbarButtons,
    isAuthenticated,
    menuSections,
    user,
  };
};
