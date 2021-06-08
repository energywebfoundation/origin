import { TFunction } from 'i18next';
import { TMenuSection } from '@energyweb/origin-ui-core';

interface IGetAdminMenuFnArgs {
  t: TFunction;
  showUsers: boolean;
  showClaims: boolean;
}

type TUseAdminMenuFn = (
  args?: IGetAdminMenuFnArgs
) => Omit<TMenuSection, 'isOpen'>;

export const getAdminMenu: TUseAdminMenuFn = ({ t, showUsers, showClaims }) => {
  return {
    sectionTitle: t('navigation.admin.sectionTitle'),
    rootUrl: 'admin',
    show: true,
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
