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
import {
  useInvitationControllerGetInvitations,
  useRegistrationControllerGetRegistrations,
} from '@energyweb/origin-organization-irec-api-react-query-client';

export const useAppContainerEffects = () => {
  useAxiosInterceptors();

  const { t } = useTranslation();
  const { isAuthenticated, user, logout, userLoading } = useUser();

  const topbarButtons = useTopbarButtonList(isAuthenticated, logout);
  const {
    isOrganizationTabActive,
    isDeviceTabActive,
    isAccountTabActive,
    isAdminTabAcive,
    isExchangeTabActive,
    isCertificateTabActive,
  } = useActiveMenuTab();
  const { data: userInvitations, isLoading: areInvitationsLoading } =
    useInvitationControllerGetInvitations({
      enabled: isAuthenticated,
    });
  const { data: iRecOrg, isLoading: isIRecOrgLoading } =
    useRegistrationControllerGetRegistrations({
      enabled: isAuthenticated && Boolean(user?.organization?.id),
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
    showRegisterIRec:
      userHasOrg && userIsOrgAdmin && iRecOrg && iRecOrg.length === 0,
    showCreateBeneficiary: userHasOrg && userIsOrgAdmin,
  });
  const deviceMenu = getDeviceMenu({
    t,
    isOpen: isDeviceTabActive,
    showSection: true,
    showAllDevices: true,
    showMapView: true,
    showMyDevices: userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
    showPendingDevices: userIsIssuer,
    showRegisterDevice:
      userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
    showDeviceImport: userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
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
    showCreateBundle: userIsActive && userHasOrg,
    showMyBundles: userIsActive && userHasOrg,
    showMyTrades: userIsActive && userHasOrg,
    showMyOrders: userIsActive && userHasOrg,
    showSupply: userIsActive && userHasOrg,
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
    showClaims: userIsAdminOrSupport,
    showUsers: userIsAdminOrSupport,
  });

  const menuSections = [
    deviceMenu,
    certificateMenu,
    exchangeMenu,
    orgMenu,
    accountMenu,
    adminMenu,
  ];

  const isLoading = userLoading || areInvitationsLoading || isIRecOrgLoading;

  return {
    topbarButtons,
    isAuthenticated,
    menuSections,
    user,
    isLoading,
  };
};
