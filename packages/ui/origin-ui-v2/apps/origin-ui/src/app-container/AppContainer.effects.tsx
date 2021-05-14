import { useOrganizationMenu } from '@energyweb/origin-ui-organization-logic';
import { getAccountMenu } from '@energyweb/origin-ui-user-logic';
import { useTranslation } from 'react-i18next';
import { getAdminMenu } from '@energyweb/origin-ui-user-logic';
import { useAuthIsAuthenticated } from '@energy-web/origin-ui-api-clients';
import { useAccount } from '@energyweb/origin-ui-user-view';
import { useNavigate } from 'react-router';

export const useAppContainerEffects = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthIsAuthenticated();
  const accountData = useAccount();
  const orgMenu = useOrganizationMenu({
    isLoggedIn: isAuthenticated,
    userHasOrg: Boolean(accountData?.userAccountData?.organization),
    userIsAdminOrSupport: true,
    userIsOrgAdmin: true,
    userIsActive: true,
    userOrgHasIRec: false,
    invitationsExist: true,
  });

  const accountMenu = getAccountMenu({
    t,
    isLoggedIn: isAuthenticated,
    onCloseMobileNav: () => ({}),
  });
  const adminMenu = getAdminMenu({ t, onCloseMobileNav: () => {} });
  const navigate = useNavigate();

  const menuSections = [
    orgMenu,
    {
      sectionTitle: 'Devices',
      show: true,
      rootUrl: '/devices',
      menuList: [
        {
          url: 'all-devices',
          label: 'All devices',
          show: true,
        },
        {
          url: 'my-devices',
          label: 'My devices',
          show: true,
        },
      ],
    },
    accountMenu,
    adminMenu,
  ];

  return {
    navigate: (url: string) => {
      console.log(`navigate => (${url})`);
      navigate(url);
    },
    isAuthenticated,
    menuSections,
    accountData,
  };
};
