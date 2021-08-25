import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { TransactionPendingProvider } from './context';
import {
  BlockchainInboxPage,
  ExchangeInboxPage,
  ClaimsReportPage,
  PendingPage,
  RequestsPage,
  DetailViewPage,
  ApprovedPage,
} from './pages';

export interface CertificateAppProps {
  routesConfig: {
    showExchangeInbox: boolean;
    showBlockchainInbox: boolean;
    showClaimsReport: boolean;
    showRequests: boolean;
    showPending: boolean;
    showApproved: boolean;
  };
}

export const CertificateApp: FC<CertificateAppProps> = ({ routesConfig }) => {
  const {
    showExchangeInbox,
    showBlockchainInbox,
    showClaimsReport,
    showRequests,
    showPending,
    showApproved,
  } = routesConfig;

  return (
    <Routes>
      {showExchangeInbox && (
        <Route
          path="exchange-inbox"
          element={
            <TransactionPendingProvider>
              <ExchangeInboxPage />
            </TransactionPendingProvider>
          }
        />
      )}
      {showBlockchainInbox && (
        <Route
          path="blockchain-inbox"
          element={
            <TransactionPendingProvider>
              <BlockchainInboxPage />
            </TransactionPendingProvider>
          }
        />
      )}
      {showClaimsReport && (
        <Route path="claims-report" element={<ClaimsReportPage />} />
      )}
      {showRequests && <Route path="requests" element={<RequestsPage />} />}
      {showPending && <Route path="pending" element={<PendingPage />} />}
      {showApproved && <Route path="approved" element={<ApprovedPage />} />}
      <Route path="detail-view/:id" element={<DetailViewPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
