import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ExchangeModals } from './containers';
import { ExchangeModalsProvider } from './context';
import {
  AllBundlesPage,
  CreateBundlePage,
  MyBundlesPage,
  MyTradesPage,
  ViewMarketPage,
  SupplyPage,
} from './pages';

export const ExchangeApp: FC = () => {
  return (
    <ExchangeModalsProvider>
      <Routes>
        <Route path="view-market" element={<ViewMarketPage />} />
        <Route path="/all-bundles" element={<AllBundlesPage />} />
        <Route path="/create-bundle" element={<CreateBundlePage />} />
        <Route path="/my-bundles" element={<MyBundlesPage />} />
        <Route path="/my-trades" element={<MyTradesPage />} />
        <Route path="/supply" element={<SupplyPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ExchangeModals />
    </ExchangeModalsProvider>
  );
};
