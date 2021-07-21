import { PageNotFound } from '@energyweb/origin-ui-core';
import { ExchangeModalsCenter } from './containers';
import { SupplyUpdateModalProvider } from './context';
import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CreateBundlePage, ViewMarketPage, SupplyPage } from './pages';

export const ExchangeApp: FC = () => {
  return (
    <SupplyUpdateModalProvider>
      <Routes>
        <Route path="view-market" element={<ViewMarketPage />} />
        <Route path="/create-bundle" element={<CreateBundlePage />} />
        <Route path="/supply" element={<SupplyPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ExchangeModalsCenter />
    </SupplyUpdateModalProvider>
  );
};
