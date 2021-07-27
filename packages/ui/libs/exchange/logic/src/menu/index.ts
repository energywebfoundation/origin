import { TMenuSection } from '@energyweb/origin-ui-core';

type TGetExchangeMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showViewMarket: boolean;
  showAllBundles: boolean;
  showCreateBundle: boolean;
  showMyTrades: boolean;
  showSupply: boolean;
  showMyBundles: boolean;
};

type TGetExchangeMenu = (args?: TGetExchangeMenuArgs) => TMenuSection;

export const getExchangeMenu: TGetExchangeMenu = ({
  t,
  isOpen,
  showSection,
  showViewMarket,
  showCreateBundle,
  showMyTrades,
  showSupply,
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
      url: 'my-trades',
      label: t('navigation.exchange.myTrades'),
      show: showMyTrades,
    },
    {
      url: 'supply',
      label: t('navigation.exchange.supply'),
      show: showSupply,
    },
    {
      url: 'my-bundles',
      label: t('navigation.exchange.myBundles'),
      show: showCreateBundle,
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
