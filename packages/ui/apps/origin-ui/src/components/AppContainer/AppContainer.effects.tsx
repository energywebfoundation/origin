import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';

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
  getTopbarButtonList,
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
import { useNavigate } from 'react-router';

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
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, userLoading } = useUser();
  const topbarButtons = useMemo(
    () => getTopbarButtonList(isAuthenticated, logout, t, navigate),
    [isAuthenticated, logout, t, navigate]
  );

  const {
    isOrganizationTabActive,
    isDeviceTabActive,
    isAccountTabActive,
    isAdminTabAcive,
    isExchangeTabActive,
    isCertificateTabActive,
  } = useActiveMenuTab();

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

  const { data: userInvitations, isLoading: areInvitationsLoading } =
    useInvitationControllerGetInvitations({
      query: { enabled: isAuthenticated },
    });
  const { data: iRecRegistrations, isLoading: isIRecRegistrationsLoading } =
    useRegistrationControllerGetRegistrations({
      query: {
        enabled: isAuthenticated && userHasOrg,
      },
    });
  const { data: iRecConnection, isLoading: isIRecOrgLoading } =
    useConnectionControllerGetMyConnection({
      query: {
        enabled:
          isAuthenticated &&
          userHasOrg &&
          iRecRegistrations?.length > 0 &&
          !userIsAdminOrSupport,
      },
    });

  const iRecOrg = iRecRegistrations?.length > 0 && iRecRegistrations[0];
  const iRecConnectionActive = iRecConnection?.active;

  const orgRoutesConfig: RoutesConfig['orgRoutes'] = useMemo(
    () => ({
      showRegisterOrg: !userHasOrg,
      showMyOrg: userHasOrg,
      showMembers: userHasOrg && userIsOrgAdmin,
      showInvitations:
        userHasOrg && userIsOrgAdmin
          ? true
          : !!userInvitations && userInvitations.length > 0,
      showInvite: userIsActive && userHasOrg && userIsOrgAdmin,
      showRegisterIRec: userHasOrg && userIsOrgAdmin && !Boolean(iRecOrg),
      showCreateBeneficiary: userHasOrg && userIsOrgAdmin,
      showConnectIRec:
        userHasOrg &&
        userIsOrgAdmin &&
        Boolean(iRecOrg) &&
        !userIsAdminOrSupport,
    }),
    [
      userHasOrg,
      userIsOrgAdmin,
      userInvitations,
      userIsActive,
      iRecOrg,
      userIsAdminOrSupport,
    ]
  );
  const orgMenu = useMemo(
    () =>
      getOrganizationMenu({
        t,
        isOpen: isOrganizationTabActive,
        showSection: userIsOrgAdminOrAdminOrSupport,
        menuButtonClass: isLightTheme ? classes.menuButton : undefined,
        selectedMenuItemClass: isLightTheme
          ? classes.selectedMenuItem
          : undefined,
        ...orgRoutesConfig,
      }),
    [
      t,
      isOrganizationTabActive,
      userIsOrgAdminOrAdminOrSupport,
      isLightTheme,
      orgRoutesConfig,
    ]
  );

  const deviceRoutesConfig: RoutesConfig['deviceRoutes'] = useMemo(
    () => ({
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
    }),
    [
      userIsActive,
      userHasOrg,
      userIsDeviceManagerOrAdmin,
      userIsIssuer,
      iRecConnectionActive,
      iRecOrg,
    ]
  );
  const deviceMenu = useMemo(
    () =>
      getDeviceMenu({
        t,
        isOpen: isDeviceTabActive,
        showSection: true,
        menuButtonClass: isLightTheme ? classes.menuButton : undefined,
        selectedMenuItemClass: isLightTheme
          ? classes.selectedMenuItem
          : undefined,
        ...deviceRoutesConfig,
      }),
    [t, isDeviceTabActive, isLightTheme, deviceRoutesConfig]
  );

  const certificateRoutesConfig: RoutesConfig['certificateRoutes'] = useMemo(
    () => ({
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
      showImport:
        (iRecOrg?.accountType as unknown as IRECAccountType) ===
          IRECAccountType.Participant ||
        (iRecOrg?.accountType as unknown as IRECAccountType) ===
          IRECAccountType.Both,
    }),
    [
      userIsActive,
      userHasOrg,
      userIsIssuer,
      userOrgHasBlockchainAccountAttached,
      iRecOrg,
    ]
  );
  const certificateMenu = useMemo(
    () =>
      getCertificateMenu({
        t,
        isOpen: isCertificateTabActive,
        showSection:
          (userIsActive && userHasOrg && !userIsAdminOrSupport) || userIsIssuer,
        menuButtonClass: isLightTheme ? classes.menuButton : undefined,
        selectedMenuItemClass: isLightTheme
          ? classes.selectedMenuItem
          : undefined,
        ...certificateRoutesConfig,
      }),
    [
      t,
      isCertificateTabActive,
      userIsActive,
      userHasOrg,
      userIsAdminOrSupport,
      userIsIssuer,
      isLightTheme,
      certificateRoutesConfig,
    ]
  );

  const exchangeRoutesConfig: RoutesConfig['exchangeRoutes'] = useMemo(
    () => ({
      showViewMarket: true,
      showAllBundles: true,
      showCreateBundle: userIsActive && userHasOrg,
      showMyBundles: userIsActive && userHasOrg,
      showMyTrades: userIsActive && userHasOrg,
      showMyOrders: userIsActive && userHasOrg,
      showSupply: userIsActive && userHasOrg,
    }),
    [userIsActive, userHasOrg]
  );
  const exchangeMenu = useMemo(
    () =>
      getExchangeMenu({
        t,
        isOpen: isExchangeTabActive,
        showSection: !userIsAdminOrSupport,
        menuButtonClass: isLightTheme ? classes.menuButton : undefined,
        selectedMenuItemClass: isLightTheme
          ? classes.selectedMenuItem
          : undefined,
        ...exchangeRoutesConfig,
      }),
    [
      t,
      isExchangeTabActive,
      userIsAdminOrSupport,
      isLightTheme,
      exchangeRoutesConfig,
    ]
  );

  const accountRoutesConfig: RoutesConfig['accountRoutes'] = useMemo(
    () => ({
      showSettings: true,
      showUserProfile: isAuthenticated,
    }),
    [isAuthenticated]
  );
  const accountMenu = useMemo(
    () =>
      getAccountMenu({
        t,
        isOpen: isAccountTabActive,
        showSection: true,
        menuButtonClass: isLightTheme ? classes.menuButton : undefined,
        selectedMenuItemClass: isLightTheme
          ? classes.selectedMenuItem
          : undefined,
        ...accountRoutesConfig,
      }),
    [t, isAccountTabActive, isLightTheme, accountRoutesConfig]
  );
  const adminRoutesConfig: RoutesConfig['adminRoutes'] = useMemo(
    () => ({
      showClaims: userIsAdminOrSupport,
      showAllOrgs: userIsAdminOrSupport,
      showUsers: userIsAdminOrSupport,
    }),
    [userIsAdminOrSupport]
  );
  const adminMenu = useMemo(
    () =>
      getAdminMenu({
        t,
        isOpen: isAdminTabAcive,
        showSection: userIsAdminOrSupport,
        menuButtonClass: isLightTheme ? classes.menuButton : undefined,
        selectedMenuItemClass: isLightTheme
          ? classes.selectedMenuItem
          : undefined,
        ...adminRoutesConfig,
      }),
    [t, isAdminTabAcive, userIsAdminOrSupport, isLightTheme, adminRoutesConfig]
  );

  const menuSections = useMemo(
    () => [
      deviceMenu,
      certificateMenu,
      exchangeMenu,
      orgMenu,
      accountMenu,
      adminMenu,
    ],
    [deviceMenu, certificateMenu, exchangeMenu, orgMenu, accountMenu, adminMenu]
  );

  const routesConfig: RoutesConfig = useMemo(
    () => ({
      orgRoutes: orgRoutesConfig,
      deviceRoutes: deviceRoutesConfig,
      certificateRoutes: certificateRoutesConfig,
      exchangeRoutes: exchangeRoutesConfig,
      accountRoutes: accountRoutesConfig,
      adminRoutes: adminRoutesConfig,
    }),
    [
      orgRoutesConfig,
      deviceRoutesConfig,
      certificateRoutesConfig,
      exchangeRoutesConfig,
      accountRoutesConfig,
      adminRoutesConfig,
    ]
  );

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
