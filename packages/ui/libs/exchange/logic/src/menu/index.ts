import { TMenuSection } from '@energyweb/origin-ui-core';

export type TGetExchangeMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showViewMarket: boolean;
  showAllBundles: boolean;
  showCreateBundle: boolean;
  showMyTrades: boolean;
  showSupply: boolean;
  showMyBundles: boolean;
  showMyOrders: boolean;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
};

type TGetExchangeMenu = (args?: TGetExchangeMenuArgs) => TMenuSection;

export const getExchangeMenu: TGetExchangeMenu = ({
  t,
  isOpen,
  showSection,
  showViewMarket,
  showAllBundles,
  showCreateBundle,
  showMyTrades,
  showSupply,
  showMyOrders,
  menuButtonClass,
  selectedMenuItemClass,
}) => {
  const menuList = [
    {
      url: 'view-market',
      label: t('navigation.exchange.viewMarket'),
      show: showViewMarket ?? true,
      dataCy: 'exchangeViewMarket',
    },
    {
      url: 'all-bundles',
      label: t('navigation.exchange.allBundles'),
      show: showAllBundles,
      dataCy: 'exchangeAllBundles',
    },
    {
      url: 'create-bundle',
      label: t('navigation.exchange.createBundle'),
      show: showCreateBundle,
      dataCy: 'exchangeCreateBundle',
    },
    {
      url: 'my-trades',
      label: t('navigation.exchange.myTrades'),
      show: showMyTrades,
      dataCy: 'exchangeMyTrades',
    },
    {
      url: 'my-bundles',
      label: t('navigation.exchange.myBundles'),
      show: showCreateBundle,
      dataCy: 'exchangeMyBundles',
    },
    {
      url: 'my-orders',
      label: t('navigation.exchange.myOrders'),
      show: showMyOrders,
      dataCy: 'exchangeMyOrders',
    },
    {
      url: 'supply',
      label: t('navigation.exchange.supply'),
      show: showSupply,
      dataCy: 'exchangeSupply',
    },
  ];

  return {
    isOpen,
    dataCy: 'exchangeMenu',
    sectionTitle: t('navigation.exchange.sectionTitle'),
    show: showSection,
    rootUrl: '/exchange',
    menuList,
    menuButtonClass,
    selectedMenuItemClass,
  };
};
