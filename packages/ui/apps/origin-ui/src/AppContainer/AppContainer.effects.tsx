import { useTranslation } from 'react-i18next';

import {
  getOrganizationMenu,
  TGetOrganizationMenuArgs,
} from '@energyweb/origin-ui-organization-logic';
import {
  getDeviceMenu,
  TGetDeviceMenuArgs,
} from '@energyweb/origin-ui-device-logic';
import {
  getExchangeMenu,
  TGetExchangeMenuArgs,
} from '@energyweb/origin-ui-exchange-logic';
import {
  getCertificateMenu,
  TGetCertificateMenuArgs,
} from '@energyweb/origin-ui-certificate-logic';
import {
  getAccountMenu,
  getAdminMenu,
  TGetAccountMenuArgs,
  TGetAdminMenuArgs,
  useTopbarButtonList,
} from '@energyweb/origin-ui-user-logic';

import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { useUser } from '@energyweb/origin-ui-user-data';
import { useActiveMenuTab, useAxiosDefaults } from '../hooks';
import {
  useInvitationControllerGetInvitations,
  useRegistrationControllerGetRegistrations,
} from '@energyweb/origin-organization-irec-api-react-query-client';

export type RoutesConfig = {
  orgRoutes: Omit<TGetOrganizationMenuArgs, 't' | 'isOpen' | 'showSection'>;
  deviceRoutes: Omit<TGetDeviceMenuArgs, 't' | 'isOpen' | 'showSection'>;
  certificateRoutes: Omit<
    TGetCertificateMenuArgs,
    't' | 'isOpen' | 'showSection'
  >;
  exchangeRoutes: Omit<TGetExchangeMenuArgs, 't' | 'isOpen' | 'showSection'>;
  accountRoutes: Omit<TGetAccountMenuArgs, 't' | 'isOpen' | 'showSection'>;
  adminRoutes: Omit<TGetAdminMenuArgs, 't' | 'isOpen' | 'showSection'>;
};

export const useAppContainerEffects = () => {
  useAxiosDefaults();

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
  const userOrgHasBlockchainAccountAttached = Boolean(
    user?.organization?.blockchainAccountAddress
  );

  const orgRoutesConfig: RoutesConfig['orgRoutes'] = {
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
  };
  const orgMenu = getOrganizationMenu({
    t,
    isOpen: isOrganizationTabActive,
    showSection: userIsOrgAdminOrAdminOrSupport,
    ...orgRoutesConfig,
  });

  const deviceRoutesConfig: RoutesConfig['deviceRoutes'] = {
    showAllDevices: true,
    showMapView: true,
    showMyDevices: userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
    showPendingDevices: userIsIssuer,
    showRegisterDevice:
      userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
    showDeviceImport: userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
  };
  const deviceMenu = getDeviceMenu({
    t,
    isOpen: isDeviceTabActive,
    showSection: true,
    ...deviceRoutesConfig,
  });

  const certificateRoutesConfig: RoutesConfig['certificateRoutes'] = {
    showExchangeInbox: userIsActive && userHasOrg && !userIsIssuer,
    showBlockchainInbox:
      userIsActive &&
      userHasOrg &&
      userOrgHasBlockchainAccountAttached &&
      !userIsIssuer,
    showClaimsReport: userIsActive && userHasOrg && !userIsIssuer,
    showRequests: userIsActive && userHasOrg && !userIsIssuer,
    showPending: userIsIssuer,
    showApproved: userIsIssuer,
    showImport: true,
  };
  const certificateMenu = getCertificateMenu({
    t,
    isOpen: isCertificateTabActive,
    showSection: (userIsActive && userHasOrg) || userIsIssuer,
    ...certificateRoutesConfig,
  });

  const exchangeRoutesConfig: RoutesConfig['exchangeRoutes'] = {
    showViewMarket: true,
    showAllBundles: true,
    showCreateBundle: userIsActive && userHasOrg,
    showMyBundles: userIsActive && userHasOrg,
    showMyTrades: userIsActive && userHasOrg,
    showMyOrders: userIsActive && userHasOrg,
    showSupply: userIsActive && userHasOrg,
  };
  const exchangeMenu = getExchangeMenu({
    t,
    isOpen: isExchangeTabActive,
    showSection: true,
    ...exchangeRoutesConfig,
  });

  const accountRoutesConfig: RoutesConfig['accountRoutes'] = {
    showSettings: true,
    showUserProfile: isAuthenticated,
  };
  const accountMenu = getAccountMenu({
    t,
    isOpen: isAccountTabActive,
    showSection: true,
    ...accountRoutesConfig,
  });
  const adminRoutesConfig: RoutesConfig['adminRoutes'] = {
    showClaims: userIsAdminOrSupport,
    showUsers: userIsAdminOrSupport,
  };
  const adminMenu = getAdminMenu({
    t,
    isOpen: isAdminTabAcive,
    showSection: userIsAdminOrSupport,
    ...adminRoutesConfig,
  });

  const menuSections = [
    deviceMenu,
    certificateMenu,
    exchangeMenu,
    orgMenu,
    accountMenu,
    adminMenu,
  ];

  const routesConfig: RoutesConfig = {
    orgRoutes: orgRoutesConfig,
    deviceRoutes: deviceRoutesConfig,
    certificateRoutes: certificateRoutesConfig,
    exchangeRoutes: exchangeRoutesConfig,
    accountRoutes: accountRoutesConfig,
    adminRoutes: adminRoutesConfig,
  };

  const isLoading = userLoading || areInvitationsLoading || isIRecOrgLoading;

  return {
    topbarButtons,
    isAuthenticated,
    menuSections,
    user,
    isLoading,
    routesConfig,
  };
};
