import { TMenuSection } from '@energyweb/origin-ui-core';

type TGetOrganizationMenuArgs = {
  t: (tag: string) => string;
  isLoggedIn: boolean;
  userHasOrg: boolean;
  userIsAdminOrSupport: boolean;
  userIsOrgAdmin: boolean;
  userIsActive: boolean;
  userOrgHasIRec: boolean;
  invitationsExist: boolean;
};

type TGetOrganizationMenu = (
  args?: TGetOrganizationMenuArgs
) => Omit<TMenuSection, 'isOpen'>;

export const getOrganizationMenu: TGetOrganizationMenu = ({
  t,
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
      label: t('navigation.organization.register'),
      show: !userHasOrg,
    },
    {
      url: '/my',
      label: t('navigation.organization.my'),
      show: userHasOrg,
    },
    {
      url: '/members',
      label: t('navigation.organization.members'),
      show: userHasOrg && userIsOrgAdmin,
    },
    {
      url: '/invitations',
      label: t('navigation.organization.invitations'),
      show: userHasOrg && userIsOrgAdmin ? true : invitationsExist,
    },
    {
      url: '/invite',
      label: t('navigation.organization.invite'),
      show: userIsActive && userHasOrg && userIsOrgAdmin,
    },
    {
      url: '/all',
      label: t('navigation.organization.all'),
      show: isLoggedIn && userIsActive && userIsAdminOrSupport,
    },
    {
      url: '/register-irec',
      label: t('navigation.organization.registerIRec'),
      show: userHasOrg && !userOrgHasIRec && !userIsAdminOrSupport,
    },
  ];

  return {
    sectionTitle: t('navigation.organization.sectionTitle'),
    show: true,
    rootUrl: '/organization',
    menuList,
  };
};
