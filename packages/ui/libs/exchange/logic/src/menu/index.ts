import { TMenuSection } from '@energyweb/origin-ui-core';

type TGetExchangeMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showViewMarket: boolean;
  showCreateBundle: boolean;
};

type TGetExchangeMenu = (args?: TGetExchangeMenuArgs) => TMenuSection;

export const getExchangeMenu: TGetExchangeMenu = ({
  t,
  isOpen,
  showSection,
  showViewMarket,
  showCreateBundle,
}) => {
  const menuList = [
    {
      url: 'view-market',
      label: t('navigation.exchange.viewMarket'),
      show: showViewMarket ?? true,
    },
    {
      url: 'create-bundle',
      label: t('navigation.exchange.createBundle'),
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
