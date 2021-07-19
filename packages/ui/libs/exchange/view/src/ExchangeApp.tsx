import { PageNotFound } from '@energyweb/origin-ui-core';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  AllBundlesPage,
  CreateBundlePage,
  MyBundlesPage,
  ViewMarketPage,
} from './pages';

export const ExchangeApp: FC = () => {
  return (
    <Routes>
      <Route path="view-market" element={<ViewMarketPage />} />
      <Route path="/all-bundles" element={<AllBundlesPage />} />
      <Route path="/create-bundle" element={<CreateBundlePage />} />
      <Route path="/my-bundles" element={<MyBundlesPage />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
