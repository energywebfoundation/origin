import { TMenuSection } from '@energyweb/origin-ui-core';

type TGetCertificateMenuArgs = {
  t: (tag: string) => string;
  isOpen: boolean;
  showSection: boolean;
  showExchangeInbox: boolean;
  showBlockchainInbox: boolean;
  showClaimsReport: boolean;
  showRequests: boolean;
  showPending: boolean;
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
  ];

  return {
    isOpen,
    sectionTitle: t('navigation.certificate.sectionTitle'),
    show: showSection,
    rootUrl: '/certificate',
    menuList,
  };
};
