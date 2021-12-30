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
      dataCy: 'organizationRegister',
    },
    {
      url: 'my',
      label: t('navigation.organization.my'),
      show: showMyOrg,
      dataCy: 'myOrganization',
    },
    {
      url: 'members',
      label: t('navigation.organization.members'),
      show: showMembers,
      dataCy: 'organizationMembers',
    },
    {
      url: 'invitations',
      label: t('navigation.organization.invitations'),
      show: showInvitations,
      dataCy: 'organizationInvitations',
    },
    {
      url: 'invite',
      label: t('navigation.organization.invite'),
      show: showInvite,
      dataCy: 'organizationInvite',
    },
    {
      url: 'register-irec',
      label: t('navigation.organization.registerIRec'),
      show: showRegisterIRec,
      dataCy: 'organizationRegisterIRec',
    },
    {
      url: 'create-beneficiary',
      label: t('navigation.organization.createBeneficiary'),
      show: showCreateBeneficiary,
      dataCy: 'organizationCreateBeneficiary',
    },
    {
      url: 'connect-irec',
      label: t('navigation.organization.connectIRec'),
      show: showConnectIRec,
      dataCy: 'organizationConnectIRec',
    },
  ];

  return {
    isOpen,
    dataCy: 'organizationMenu',
    sectionTitle: t('navigation.organization.sectionTitle'),
    show: showSection,
    rootUrl: '/organization',
    menuList,
    selectedMenuItemClass,
    menuButtonClass,
  };
};
