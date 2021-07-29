import { TMenuSection, TModuleMenuItem } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

type TGetOrganizationMenuArgs = {
  t: TFunction;
  isOpen: boolean;
  showSection: boolean;
  showRegisterOrg: boolean;
  showMyOrg: boolean;
  showMembers: boolean;
  showInvitations: boolean;
  showInvite: boolean;
  showAllOrgs: boolean;
  showRegisterIRec: boolean;
  showCreateBeneficiary: boolean;
};

type TGetOrganizationMenu = (args?: TGetOrganizationMenuArgs) => TMenuSection;

export const getOrganizationMenu: TGetOrganizationMenu = ({
  t,
  isOpen,
  showSection,
  showRegisterOrg,
  showMyOrg,
  showMembers,
  showInvitations,
  showInvite,
  showAllOrgs,
  showRegisterIRec,
  showCreateBeneficiary,
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
    {
      url: '/create-beneficiary',
      label: t('navigation.organization.createBeneficiary'),
      show: showCreateBeneficiary,
    },
  ];

  return {
    isOpen,
    sectionTitle: t('navigation.organization.sectionTitle'),
    show: showSection,
    rootUrl: '/organization',
    menuList,
  };
};
