import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  BlockchainInboxPage,
  ExchangeInboxPage,
  PendingPage,
  RequestsPage,
} from './pages';

export const CertificateApp: FC = () => {
  return (
    <Routes>
      <Route path="exchange-inbox" element={<ExchangeInboxPage />} />
      <Route path="blockchain-inbox" element={<BlockchainInboxPage />} />
      <Route path="requests" element={<RequestsPage />} />
      <Route path="pending" element={<PendingPage />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
