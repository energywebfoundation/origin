import { PageNotFound } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC, lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CertificateModalsCenter } from './containers';
import {
  CertificateAppEnvProvider,
  CertificateEnvVariables,
  CertificateModalsProvider,
  TransactionPendingProvider,
} from './context';

const ExchangeInboxPage = lazy(
  () => import('./pages/ExchangeInboxPage/ExchangeInboxPage')
);
const BlockchainInboxPage = lazy(
  () => import('./pages/BlockchainInboxPage/BlockchainInboxPage')
);
const ClaimsReportPage = lazy(
  () => import('./pages/ClaimsReportPage/ClaimsReportPage')
);
const RequestsPage = lazy(() => import('./pages/RequestsPage/RequestsPage'));
const PendingPage = lazy(() => import('./pages/PendingPage/PendingPage'));
const ApprovedPage = lazy(() => import('./pages/ApprovedPage/ApprovedPage'));
const DetailViewPage = lazy(
  () => import('./pages/DetailViewPage/DetailViewPage')
);
const CertificatesImportPage = lazy(
  () => import('./pages/CertificatesImportPage/CertificatesImportPage')
);

export interface CertificateAppProps {
  routesConfig: {
    showExchangeInbox: boolean;
    showBlockchainInbox: boolean;
    showClaimsReport: boolean;
    showRequests: boolean;
    showPending: boolean;
    showApproved: boolean;
    showImport: boolean;
  };
  envVariables: CertificateEnvVariables;
}

export const CertificateApp: FC<CertificateAppProps> = ({
  routesConfig,
  envVariables,
}) => {
  const {
    showExchangeInbox,
    showBlockchainInbox,
    showClaimsReport,
    showRequests,
    showPending,
    showApproved,
    showImport,
  } = routesConfig;

  return (
    <CertificateAppEnvProvider variables={envVariables}>
      <CertificateModalsProvider>
        <Routes>
          {showExchangeInbox && (
            <Route
              path="exchange-inbox"
              element={
                <TransactionPendingProvider>
                  <Suspense fallback={<CircularProgress />}>
                    <ExchangeInboxPage />
                  </Suspense>
                </TransactionPendingProvider>
              }
            />
          )}
          {showBlockchainInbox && (
            <Route
              path="blockchain-inbox"
              element={
                <TransactionPendingProvider>
                  <Suspense fallback={<CircularProgress />}>
                    <BlockchainInboxPage />
                  </Suspense>
                </TransactionPendingProvider>
              }
            />
          )}
          {showClaimsReport && (
            <Route
              path="claims-report"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <ClaimsReportPage />
                </Suspense>
              }
            />
          )}
          {showRequests && (
            <Route
              path="requests"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <RequestsPage />
                </Suspense>
              }
            />
          )}
          {showPending && (
            <Route
              path="pending"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <PendingPage />
                </Suspense>
              }
            />
          )}
          {showApproved && (
            <Route
              path="approved"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <ApprovedPage />
                </Suspense>
              }
            />
          )}
          {showImport && (
            <Route
              path="import"
              element={
                <Suspense fallback={<CircularProgress />}>
                  <CertificatesImportPage />
                </Suspense>
              }
            />
          )}
          <Route
            path="detail-view/:id"
            element={
              <Suspense fallback={<CircularProgress />}>
                <DetailViewPage />
              </Suspense>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <CertificateModalsCenter />
      </CertificateModalsProvider>
    </CertificateAppEnvProvider>
  );
};
