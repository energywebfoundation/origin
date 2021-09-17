import { TMenuSection } from '@energyweb/origin-ui-core';

export type TGetCertificateMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showExchangeInbox: boolean;
  showBlockchainInbox: boolean;
  showClaimsReport: boolean;
  showRequests: boolean;
  showPending: boolean;
  showApproved: boolean;
  showImport: boolean;
  menuButtonClass?: string;
  selectedMenuItemClass?: string;
};

type TGetCertificateMenu = (args?: TGetCertificateMenuArgs) => TMenuSection;

export const getCertificateMenu: TGetCertificateMenu = ({
  t,
  isOpen,
  showSection,
  showExchangeInbox,
  showBlockchainInbox,
  showClaimsReport,
  showRequests,
  showPending,
  showApproved,
  showImport,
  menuButtonClass,
  selectedMenuItemClass,
}) => {
  const menuList = [
    {
      url: 'exchange-inbox',
      label: t('navigation.certificate.exchangeInbox'),
      show: showExchangeInbox,
    },
    {
      url: 'blockchain-inbox',
      label: t('navigation.certificate.blockchainInbox'),
      show: showBlockchainInbox,
    },
    {
      url: 'claims-report',
      label: t('navigation.certificate.claimsReport'),
      show: showClaimsReport,
    },
    {
      url: 'requests',
      label: t('navigation.certificate.requests'),
      show: showRequests,
    },
    {
      url: 'pending',
      label: t('navigation.certificate.pending'),
      show: showPending,
    },
    {
      url: 'approved',
      label: t('navigation.certificate.approved'),
      show: showApproved,
    },
    {
      url: 'import',
      label: t('navigation.certificate.import'),
      show: showImport,
    },
  ];

  return {
    isOpen,
    sectionTitle: t('navigation.certificate.sectionTitle'),
    show: showSection,
    rootUrl: '/certificate',
    menuList,
    menuButtonClass,
    selectedMenuItemClass,
  };
};
