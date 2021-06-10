import React from 'react';

import { Route, Routes } from 'react-router';
import ExchangeViewMarketPage from '../pages/exchange-view-market-page/ExchangeViewMarketPage';
import ExchangeBundlesPage from '../pages/exchange-bundles-page/ExchangeBundlesPage';
import ExchangeCreateBundlePage from '../pages/exchange-create-bundle-page/ExchangeCreateBundlePage';
import ExchangeMyBundlesPage from '../pages/exchange-my-bundles-page/ExchangeMyBundlesPage';
import ExchangeMyTradesPage from '../pages/exchange-my-trades-page/ExchangeMyTradesPage';
import ExchangeMyOrdersPage from '../pages/exchange-my-orders-page/ExchangeMyOrdersPage';
import ExchangeSupplyPage from '../pages/exchange-supply-page/ExchangeSupplyPage';
/* eslint-disable-next-line */
export interface ExchangeAppProps {}

export const ExchangeApp = () => (
  <Routes>
    <Route path={'view-market'} element={<ExchangeViewMarketPage />} />
    <Route path={'bundles'} element={<ExchangeBundlesPage />} />
    <Route path={'create-bundle'} element={<ExchangeCreateBundlePage />} />
    <Route path={'my-bundles'} element={<ExchangeMyBundlesPage />} />
    <Route path={'my-trades'} element={<ExchangeMyTradesPage />} />
    <Route path={'my-orders'} element={<ExchangeMyOrdersPage />} />
    <Route path={'supply'} element={<ExchangeSupplyPage />} />
  </Routes>
);

export default ExchangeApp;
