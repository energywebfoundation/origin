import { TMenuSection } from '@energyweb/origin-ui-core';
import { TFunction } from 'i18next';

interface IExchangeMenuFnArgs {
  t: TFunction;
}

type TGetExchangeMenuFn = (args: IExchangeMenuFnArgs) => TMenuSection;

export const getExchangeMenu: TGetExchangeMenuFn = ({ t }) => {
  const useUserInfo = () => ({ userIsActiveAndPartOfOrg: true });

  const { userIsActiveAndPartOfOrg } = useUserInfo();
  return {
    closeMobileNav: () => {},
    rootUrl: 'exchange',
    isOpen: false,
    show: true,
    sectionTitle: t('navigation.exchange.sectionTitle'),
    menuList: [
      {
        url: 'view-market',
        label: t('navigation.exchange.view_market'),
        show: true,
      },
      {
        url: 'bundles',
        label: t('navigation.exchange.bundles'),
        show: true,
      },
      {
        url: 'create-bundle',
        label: t('navigation.exchange.create_bundle'),
        show: userIsActiveAndPartOfOrg,
      },
      {
        url: 'my-bundles',
        label: 'navigation.exchange.my_bundles',
        show: userIsActiveAndPartOfOrg,
      },
      {
        url: 'my-trades',
        label: 'navigation.exchange.my_trades',
        show: userIsActiveAndPartOfOrg,
      },
      {
        url: 'my-orders',
        label: 'navigation.exchange.my_orders',
        show: userIsActiveAndPartOfOrg,
      },
      {
        url: 'supply',
        label: 'navigation.exchange.supply',
        show: userIsActiveAndPartOfOrg,
      },
    ],
  };
};
