import { TFunction } from 'i18next';
import { TMenuSection } from '@energyweb/origin-ui-core';

interface IGetAdminMenuFnArgs {
  t: TFunction;
  onCloseMobileNav: () => void;
}

type TUseAdminMenuFn = (
  args?: IGetAdminMenuFnArgs
) => Omit<TMenuSection, 'isOpen'>;

export const getAdminMenu: TUseAdminMenuFn = ({ t, onCloseMobileNav }) => {
  return {
    sectionTitle: t('Admin'),
    closeMobileNav: onCloseMobileNav,
    rootUrl: 'admin',
    show: true,
    menuList: [
      {
        url: 'manage-user',
        label: t('navigation.admin.users'),
        show: true,
      },
      {
        url: 'claims',
        label: t('navigation.admin.claims'),
        show: true,
      },
    ],
  };
};
