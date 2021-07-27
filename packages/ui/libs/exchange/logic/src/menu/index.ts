import { TMenuSection } from '@energyweb/origin-ui-core';

type TGetExchangeMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showViewMarket: boolean;
  showAllBundles: boolean;
  showCreateBundle: boolean;
  showSupply: boolean;
  showMyBundles: boolean;
  showMyOrders: boolean;
};

type TGetExchangeMenu = (args?: TGetExchangeMenuArgs) => TMenuSection;

export const getExchangeMenu: TGetExchangeMenu = ({
  t,
  isOpen,
  showSection,
  showViewMarket,
  showCreateBundle,
  showSupply,
  showMyOrders,
}) => {
  const menuList = [
    {
      url: 'view-market',
      label: t('navigation.exchange.viewMarket'),
      show: showViewMarket ?? true,
    },
    {
      url: 'all-bundles',
      label: t('navigation.exchange.allBundles'),
      show: showCreateBundle,
    },
    {
      url: 'create-bundle',
      label: t('navigation.exchange.createBundle'),
      show: showCreateBundle,
    },
    {
      url: 'my-bundles',
      label: t('navigation.exchange.myBundles'),
      show: showCreateBundle,
    },
    {
      url: 'my-orders',
      label: t('navigation.exchange.myOrders'),
      show: showMyOrders,
    },
    {
      url: 'supply',
      label: t('navigation.exchange.supply'),
      show: showSupply,
    },
  ];

  return {
    isOpen,
    sectionTitle: t('navigation.exchange.sectionTitle'),
    show: showSection,
    rootUrl: '/exchange',
    menuList,
  };
};
