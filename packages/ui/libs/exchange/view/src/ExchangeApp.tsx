import { PageNotFound } from '@energyweb/origin-ui-core';
import { CircularProgress } from '@mui/material';
import React, { FC, lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ExchangeModals } from './containers';
import { ExchangeModalsProvider } from './context';

const ViewMarketPage = lazy(
  () => import('./pages/ViewMarketPage/ViewMarketPage')
);
const AllBundlesPage = lazy(
  () => import('./pages/AllBundlesPage/AllBundlesPage')
);
const CreateBundlePage = lazy(
  () => import('./pages/CreateBundlePage/CreateBundlePage')
);
const MyBundlesPage = lazy(() => import('./pages/MyBundlesPage/MyBundlesPage'));
const MyTradesPage = lazy(() => import('./pages/MyTradesPage/MyTradesPage'));
const SupplyPage = lazy(() => import('./pages/SupplyPage/SupplyPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage/MyOrdersPage'));

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
          <Route
            path="/view-market"
            element={
              <Suspense fallback={<CircularProgress />}>
                <ViewMarketPage />
              </Suspense>
            }
          />
        )}
        {showAllBundles && (
          <Route
            path="/all-bundles"
            element={
              <Suspense fallback={<CircularProgress />}>
                <AllBundlesPage />
              </Suspense>
            }
          />
        )}
        {showCreateBundle && (
          <Route
            path="/create-bundle"
            element={
              <Suspense fallback={<CircularProgress />}>
                <CreateBundlePage />
              </Suspense>
            }
          />
        )}
        {showMyBundles && (
          <Route
            path="/my-bundles"
            element={
              <Suspense fallback={<CircularProgress />}>
                <MyBundlesPage />
              </Suspense>
            }
          />
        )}
        {showMyTrades && (
          <Route
            path="/my-trades"
            element={
              <Suspense fallback={<CircularProgress />}>
                <MyTradesPage />
              </Suspense>
            }
          />
        )}
        {showSupply && (
          <Route
            path="/supply"
            element={
              <Suspense fallback={<CircularProgress />}>
                <SupplyPage />
              </Suspense>
            }
          />
        )}
        {showMyOrders && (
          <Route
            path="/my-orders"
            element={
              <Suspense fallback={<CircularProgress />}>
                <MyOrdersPage />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ExchangeModals />
    </ExchangeModalsProvider>
  );
};
