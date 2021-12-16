import { TMenuSection } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

export type TGetAccountMenuArgs = {
  t: TFunction;
  isOpen: boolean;
  showSection: boolean;
  showSettings: boolean;
  showUserProfile: boolean;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
};

type TGetAccountMenuFn = (args?: TGetAccountMenuArgs) => TMenuSection;

export const getAccountMenu: TGetAccountMenuFn = ({
  t,
  isOpen,
  showSettings,
  showUserProfile,
  selectedMenuItemClass,
  menuButtonClass,
}) => ({
  isOpen,
  dataCy: 'settingsMenu',
  sectionTitle: showUserProfile
    ? t('navigation.account.sectionTitle')
    : t('navigation.account.sectionTitleForUnlogged'),
  rootUrl: '/account',
  show: true,
  menuList: [
    {
      url: 'settings',
      label: t('navigation.account.settings'),
      show: showSettings,
      dataCy: 'accountSettings',
    },
    {
      url: 'profile',
      label: t('navigation.account.userProfile'),
      show: showUserProfile,
      dataCy: 'accountUserProfile',
    },
  ],
  menuButtonClass,
  selectedMenuItemClass,
});
