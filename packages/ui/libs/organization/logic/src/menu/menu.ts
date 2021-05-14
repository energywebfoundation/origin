import { TMenuSection, TModuleMenuItem } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

type TGetOrganizationMenuArgs = {
  t: TFunction;
  showRegisterOrg: boolean;
  showMyOrg: boolean;
  showMembers: boolean;
  showInvitations: boolean;
  showInvite: boolean;
  showAllOrgs: boolean;
  showRegisterIRec: boolean;
};

type TGetOrganizationMenu = (
  args?: TGetOrganizationMenuArgs
) => Omit<TMenuSection, 'isOpen'>;

export const getOrganizationMenu: TGetOrganizationMenu = ({
  t,
  showRegisterOrg,
  showMyOrg,
  showMembers,
  showInvitations,
  showInvite,
  showAllOrgs,
  showRegisterIRec,
}) => {
  const menuList: TModuleMenuItem[] = [
    {
      url: '/register',
      label: t('navigation.organization.register'),
      show: showRegisterOrg,
    },
    {
      url: '/my',
      label: t('navigation.organization.my'),
      show: showMyOrg,
    },
    {
      url: '/members',
      label: t('navigation.organization.members'),
      show: showMembers,
    },
    {
      url: '/invitations',
      label: t('navigation.organization.invitations'),
      show: showInvitations,
    },
    {
      url: '/invite',
      label: t('navigation.organization.invite'),
      show: showInvite,
    },
    {
      url: '/all',
      label: t('navigation.organization.all'),
      show: showAllOrgs,
    },
    {
      url: '/register-irec',
      label: t('navigation.organization.registerIRec'),
      show: showRegisterIRec,
    },
  ];

  return {
    sectionTitle: t('navigation.organization.sectionTitle'),
    show: true,
    rootUrl: '/organization',
    menuList,
  };
};
