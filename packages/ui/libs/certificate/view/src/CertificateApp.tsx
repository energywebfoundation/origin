import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  BlockchainInboxPage,
  ExchangeInboxPage,
  ClaimsReportPage,
  PendingPage,
  RequestsPage,
  DetailViewPage,
} from './pages';

export const CertificateApp: FC = () => {
  return (
    <Routes>
      <Route path="exchange-inbox" element={<ExchangeInboxPage />} />
      <Route path="blockchain-inbox" element={<BlockchainInboxPage />} />
      <Route path="claims-report" element={<ClaimsReportPage />} />
      <Route path="requests" element={<RequestsPage />} />
      <Route path="pending" element={<PendingPage />} />
      <Route path="detail-view/:id" element={<DetailViewPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
