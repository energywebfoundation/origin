// @should-localize
import { TMenuSection } from '@energyweb/origin-ui-core';

type TUseOrganizationMenuArgs = {
  isLoggedIn: boolean;
  userHasOrg: boolean;
  userIsAdminOrSupport: boolean;
  userIsOrgAdmin: boolean;
  userIsActive: boolean;
  userOrgHasIRec: boolean;
  invitationsExist: boolean;
};

type TUseOrganizationMenu = (
  args?: TUseOrganizationMenuArgs
) => Omit<TMenuSection, 'isOpen'>;

export const useOrganizationMenu: TUseOrganizationMenu = ({
  isLoggedIn,
  userHasOrg,
  userIsAdminOrSupport,
  userIsOrgAdmin,
  userIsActive,
  userOrgHasIRec,
  invitationsExist,
}) => {
  const menuList = [
    {
      url: '/register',
      label: 'Register',
      show: !userHasOrg,
    },
    {
      url: '/my',
      label: 'My Organization',
      show: userHasOrg,
    },
    {
      url: '/members',
      label: 'Members',
      show: userHasOrg && userIsOrgAdmin,
    },
    {
      url: '/invitations',
      label: 'Invitations',
      show: userHasOrg && userIsOrgAdmin ? true : invitationsExist,
    },
    {
      url: '/invite',
      label: 'Invite',
      show: userIsActive && userHasOrg && userIsOrgAdmin,
    },
    {
      url: '/all',
      label: 'All Organizations',
      show: isLoggedIn && userIsActive && userIsAdminOrSupport,
    },
    {
      url: '/register-irec',
      label: 'Register I-REC',
      show: userHasOrg && !userOrgHasIRec && !userIsAdminOrSupport,
    },
  ];

  return {
    sectionTitle: 'Organization',
    show: true,
    rootUrl: '/organization',
    menuList,
  };
};
