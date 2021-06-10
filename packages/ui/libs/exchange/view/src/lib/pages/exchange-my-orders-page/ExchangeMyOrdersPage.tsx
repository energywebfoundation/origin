import React from 'react';

import { useExchangeMyOrdersPageEffects } from './ExchangeMyOrdersPage.effects';
import ExchangeMyOrdersDemandsTable from '../../components/exchange-my-orders-demands-table/ExchangeMyOrdersDemandsTable';
import ExchangeMyOrdersOpenAsksTable from '../../components/exchange-my-orders-open-asks-table/ExchangeMyOrdersOpenAsksTable';
import ExchangeMyOrdersOpenBidsTable from '../../components/exchange-my-orders-open-bids-table/ExchangeMyOrdersOpenBidsTable';

/* eslint-disable-next-line */
export interface ExchangeMyOrdersPageProps {}

export const ExchangeMyOrdersPage = () => {
  const { isLoading, allDemands, openAsks, openBids } =
    useExchangeMyOrdersPageEffects();

  return (
    <>
      <ExchangeMyOrdersDemandsTable loading={isLoading} data={allDemands} />
      <ExchangeMyOrdersOpenAsksTable loading={isLoading} data={openAsks} />
      <ExchangeMyOrdersOpenBidsTable loading={isLoading} data={openBids} />
    </>
  );
};

export default ExchangeMyOrdersPage;
