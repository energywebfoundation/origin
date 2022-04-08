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
      url: 'all-packages',
      label: t('navigation.exchange.allPackages'),
      show: showAllBundles,
      dataCy: 'exchangeAllPackages',
    },
    {
      url: 'create-package',
      label: t('navigation.exchange.createPackage'),
      show: showCreateBundle,
      dataCy: 'exchangeCreatePackage',
    },
    {
      url: 'my-trades',
      label: t('navigation.exchange.myTrades'),
      show: showMyTrades,
      dataCy: 'exchangeMyTrades',
    },
    {
      url: 'my-packages',
      label: t('navigation.exchange.myPackages'),
      show: showCreateBundle,
      dataCy: 'exchangeMyPackages',
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
