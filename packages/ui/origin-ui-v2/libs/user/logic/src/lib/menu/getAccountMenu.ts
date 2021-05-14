import { TMenuSection } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

interface IAccountMenuFnArgs {
  t: TFunction;
  isLoggedIn: boolean;
  onCloseMobileNav: () => void;
}

type TGetAccountMenuFn = (
  args?: IAccountMenuFnArgs
) => Omit<TMenuSection, 'isOpen'>;

export const getAccountMenu: TGetAccountMenuFn = ({
  t,
  isLoggedIn,
  onCloseMobileNav,
}) => ({
  sectionTitle: 'Settings',
  closeMobileNav: onCloseMobileNav,
  rootUrl: 'account',
  show: true,
  menuList: [
    {
      url: 'settings',
      label: t('settings.navigation.settings'),
      show: true,
    },
    {
      url: 'user-profile',
      label: t('settings.navigation.userProfile'),
      show: isLoggedIn,
    },
  ],
});
