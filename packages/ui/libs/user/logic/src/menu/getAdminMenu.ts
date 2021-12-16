import { TFunction } from 'i18next';
import { TMenuSection } from '@energyweb/origin-ui-core';

export type TGetAdminMenuArgs = {
  t: TFunction;
  isOpen: boolean;
  showSection: boolean;
  showUsers: boolean;
  showClaims: boolean;
  showAllOrgs: boolean;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
};

type TUseAdminMenuFn = (args?: TGetAdminMenuArgs) => TMenuSection;

export const getAdminMenu: TUseAdminMenuFn = ({
  t,
  isOpen,
  showSection,
  showUsers,
  showAllOrgs,
  showClaims,
  menuButtonClass,
  selectedMenuItemClass,
}) => {
  return {
    isOpen,
    dataCy: 'adminMenu',
    sectionTitle: t('navigation.admin.sectionTitle'),
    rootUrl: '/admin',
    show: showSection,
    menuList: [
      {
        url: 'users',
        label: t('navigation.admin.users'),
        show: showUsers,
        dataCy: 'adminUsers',
      },
      {
        url: 'all-organizations',
        label: t('navigation.admin.allOrganizations'),
        show: showAllOrgs,
        dataCy: 'adminOrganizations',
      },
      {
        url: 'claims',
        label: t('navigation.admin.claims'),
        show: showClaims,
        dataCy: 'adminClaims',
      },
    ],
    menuButtonClass,
    selectedMenuItemClass,
  };
};
