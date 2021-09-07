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
  MyOrdersPage,
} from './pages';

export interface ExchangeAppProps {
  routesConfig: {
    showViewMarket: boolean;
    showAllBundles: boolean;
    showCreateBundle: boolean;
    showMyTrades: boolean;
    showSupply: boolean;
    showMyBundles: boolean;
    showMyOrders: boolean;
  };
}

export const ExchangeApp: FC<ExchangeAppProps> = ({ routesConfig }) => {
  const {
    showViewMarket,
    showAllBundles,
    showCreateBundle,
    showMyTrades,
    showSupply,
    showMyBundles,
    showMyOrders,
  } = routesConfig;
  return (
    <ExchangeModalsProvider>
      <Routes>
        {showViewMarket && (
          <Route path="/view-market" element={<ViewMarketPage />} />
        )}
        {showAllBundles && (
          <Route path="/all-bundles" element={<AllBundlesPage />} />
        )}
        {showCreateBundle && (
          <Route path="/create-bundle" element={<CreateBundlePage />} />
        )}
        {showMyBundles && (
          <Route path="/my-bundles" element={<MyBundlesPage />} />
        )}
        {showMyTrades && <Route path="/my-trades" element={<MyTradesPage />} />}
        {showSupply && <Route path="/supply" element={<SupplyPage />} />}
        {showMyOrders && <Route path="/my-orders" element={<MyOrdersPage />} />}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ExchangeModals />
    </ExchangeModalsProvider>
  );
};
