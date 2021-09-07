import { TMenuSection, TModuleMenuItem } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type TGetOrganizationMenuArgs = {
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
  showConnectIRec: boolean;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
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
  showConnectIRec,
  menuButtonClass,
  selectedMenuItemClass,
}) => {
  const menuList: TModuleMenuItem[] = [
    {
      url: 'register',
      label: t('navigation.organization.register'),
      show: showRegisterOrg,
    },
    {
      url: 'my',
      label: t('navigation.organization.my'),
      show: showMyOrg,
    },
    {
      url: 'members',
      label: t('navigation.organization.members'),
      show: showMembers,
    },
    {
      url: 'invitations',
      label: t('navigation.organization.invitations'),
      show: showInvitations,
    },
    {
      url: 'invite',
      label: t('navigation.organization.invite'),
      show: showInvite,
    },
    {
      url: 'all',
      label: t('navigation.organization.all'),
      show: showAllOrgs,
    },
    {
      url: 'register-irec',
      label: t('navigation.organization.registerIRec'),
      show: showRegisterIRec,
    },
    {
      url: 'create-beneficiary',
      label: t('navigation.organization.createBeneficiary'),
      show: showCreateBeneficiary,
    },
    {
      url: 'connect-irec',
      label: t('navigation.organization.connectIRec'),
      show: showConnectIRec,
    },
  ];

  return {
    isOpen,
    sectionTitle: t('navigation.organization.sectionTitle'),
    show: showSection,
    rootUrl: '/organization',
    menuList,
    selectedMenuItemClass,
    menuButtonClass,
  };
};
