import { TMenuSection } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

interface IAccountMenuFnArgs {
  t: TFunction;
  showSettings: boolean;
  showUserProfile: boolean;
}

type TGetAccountMenuFn = (
  args?: IAccountMenuFnArgs
) => Omit<TMenuSection, 'isOpen'>;

export const getAccountMenu: TGetAccountMenuFn = ({
  t,
  showSettings,
  showUserProfile,
}) => ({
  sectionTitle: t('navigation.account.sectionTitle'),
  rootUrl: 'account',
  show: true,
  menuList: [
    {
      url: 'settings',
      label: t('navigation.account.settings'),
      show: showSettings,
    },
    {
      url: 'user-profile',
      label: t('navigation.account.userProfile'),
      show: showUserProfile,
    },
  ],
});
