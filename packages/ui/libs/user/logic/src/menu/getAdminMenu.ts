import { TFunction } from 'i18next';
import { TMenuSection } from '@energyweb/origin-ui-core';

export type TGetAdminMenuArgs = {
  t: TFunction;
  isOpen: boolean;
  showSection: boolean;
  showUsers: boolean;
  showClaims: boolean;
};

type TUseAdminMenuFn = (args?: TGetAdminMenuArgs) => TMenuSection;

export const getAdminMenu: TUseAdminMenuFn = ({
  t,
  isOpen,
  showSection,
  showUsers,
  showClaims,
}) => {
  return {
    isOpen,
    sectionTitle: t('navigation.admin.sectionTitle'),
    rootUrl: 'admin',
    show: showSection,
    menuList: [
      {
        url: 'users',
        label: t('navigation.admin.users'),
        show: showUsers,
      },
      {
        url: 'claims',
        label: t('navigation.admin.claims'),
        show: showClaims,
      },
    ],
  };
};
