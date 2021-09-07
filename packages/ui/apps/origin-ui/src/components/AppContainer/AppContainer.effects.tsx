import { useTranslation } from 'react-i18next';
import { useTheme } from '@material-ui/core';

import {
  getOrganizationMenu,
  IRECAccountType,
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
import {
  useInvitationControllerGetInvitations,
  useConnectionControllerGetMyConnection,
  useRegistrationControllerGetRegistrations,
} from '@energyweb/origin-organization-irec-api-react-query-client';
import { isRole, Role, UserStatus } from '@energyweb/origin-backend-core';
import { useUser } from '@energyweb/origin-ui-user-data';
import { useActiveMenuTab, useAxiosDefaults } from '../../hooks';
import { useStyles } from './AppContainer.styles';

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
  const classes = useStyles();
  const theme = useTheme();
  const isLightTheme = theme.palette.mode === 'light';

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
  const { data: iRecConnection, isLoading: isIRecOrgLoading } =
    useConnectionControllerGetMyConnection({
      enabled: isAuthenticated && Boolean(user?.organization?.id),
    });
  const { data: iRecRegistrations, isLoading: isIRecRegistrationsLoading } =
    useRegistrationControllerGetRegistrations({
      enabled: isAuthenticated && Boolean(user?.organization?.id),
    });

  const iRecOrg = iRecRegistrations?.length > 0 && iRecRegistrations[0];
  const iRecConnectionActive = iRecConnection?.active;
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
    showRegisterIRec: userHasOrg && userIsOrgAdmin && Boolean(iRecOrg),
    showCreateBeneficiary: userHasOrg && userIsOrgAdmin,
    showConnectIRec: userHasOrg && userIsOrgAdmin,
  };
  const orgMenu = getOrganizationMenu({
    t,
    isOpen: isOrganizationTabActive,
    showSection: userIsOrgAdminOrAdminOrSupport,
    menuButtonClass: isLightTheme ? classes.menuButton : undefined,
    selectedMenuItemClass: isLightTheme ? classes.selectedMenuItem : undefined,
    ...orgRoutesConfig,
  });

  const deviceRoutesConfig: RoutesConfig['deviceRoutes'] = {
    showAllDevices: true,
    showMapView: true,
    showMyDevices: userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
    showPendingDevices: userIsIssuer,
    showRegisterDevice:
      userIsActive && userHasOrg && userIsDeviceManagerOrAdmin,
    showDeviceImport:
      userIsActive &&
      userHasOrg &&
      userIsDeviceManagerOrAdmin &&
      iRecConnectionActive &&
      // @should be fixed on backend to actually return a string
      ((iRecOrg?.accountType as unknown as IRECAccountType) ===
        IRECAccountType.Registrant ||
        (iRecOrg?.accountType as unknown as IRECAccountType) ===
          IRECAccountType.Both),
  };
  const deviceMenu = getDeviceMenu({
    t,
    isOpen: isDeviceTabActive,
    showSection: true,
    menuButtonClass: isLightTheme ? classes.menuButton : undefined,
    selectedMenuItemClass: isLightTheme ? classes.selectedMenuItem : undefined,
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
  };
  const certificateMenu = getCertificateMenu({
    t,
    isOpen: isCertificateTabActive,
    showSection: (userIsActive && userHasOrg) || userIsIssuer,
    menuButtonClass: isLightTheme ? classes.menuButton : undefined,
    selectedMenuItemClass: isLightTheme ? classes.selectedMenuItem : undefined,
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
    menuButtonClass: isLightTheme ? classes.menuButton : undefined,
    selectedMenuItemClass: isLightTheme ? classes.selectedMenuItem : undefined,
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
    menuButtonClass: isLightTheme ? classes.menuButton : undefined,
    selectedMenuItemClass: isLightTheme ? classes.selectedMenuItem : undefined,
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
    menuButtonClass: isLightTheme ? classes.menuButton : undefined,
    selectedMenuItemClass: isLightTheme ? classes.selectedMenuItem : undefined,
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

  const isLoading =
    userLoading ||
    areInvitationsLoading ||
    isIRecOrgLoading ||
    isIRecRegistrationsLoading;

  return {
    topbarButtons,
    isAuthenticated,
    menuSections,
    user,
    isLoading,
    routesConfig,
  };
};
