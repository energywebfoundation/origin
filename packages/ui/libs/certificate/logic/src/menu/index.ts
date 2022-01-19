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
      dataCy: 'certificateExchangeInbox',
    },
    {
      url: 'blockchain-inbox',
      label: t('navigation.certificate.blockchainInbox'),
      show: showBlockchainInbox,
      dataCy: 'certificateBlockchainInbox',
    },
    {
      url: 'claims-report',
      label: t('navigation.certificate.claimsReport'),
      show: showClaimsReport,
      dataCy: 'certificateClaimsReport',
    },
    {
      url: 'requests',
      label: t('navigation.certificate.requests'),
      show: showRequests,
      dataCy: 'certificateRequests',
    },
    {
      url: 'pending',
      label: t('navigation.certificate.pending'),
      show: showPending,
      dataCy: 'certificatePending',
    },
    {
      url: 'approved',
      label: t('navigation.certificate.approved'),
      show: showApproved,
      dataCy: 'certificateApproved',
    },
    {
      url: 'import',
      label: t('navigation.certificate.import'),
      show: showImport,
      dataCy: 'certificateImport',
    },
  ];

  return {
    isOpen,
    dataCy: 'certificateMenu',
    sectionTitle: t('navigation.certificate.sectionTitle'),
    show: showSection,
    rootUrl: '/certificate',
    menuList,
    menuButtonClass,
    selectedMenuItemClass,
  };
};
