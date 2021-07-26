import React from 'react';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { ListAction, ListActionsBlockProps } from '@energyweb/origin-ui-core';
import {
  OrderBookFilters,
  useApiOrderbookPoll,
} from '@energyweb/origin-ui-exchange-data';
import {
  OneTimePurchase,
  RepeatedPurchase,
  SellOffers,
  BuyOffers,
  TradingView,
} from '../../containers';
import { initialState, reducer } from './ViewMarketPage.reducer';

export const useViewMarketPageEffects = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();

  const filters: OrderBookFilters = {
    deviceType: state.deviceType.map((type) => type.value.toString()),
    gridOperator: state.gridOperator.map((type) => type.value.toString()),
    location: state.subregions.map((subregion) => subregion.value.toString()),
  };

  const { orderbookData, isLoading } = useApiOrderbookPoll(filters);

  const oneTimePurchase: ListAction = {
    name: t('exchange.viewMarket.oneTimePurchase'),
    content: <OneTimePurchase filters={state} />,
  };
  const repeatedPurchase: ListAction = {
    name: t('exchange.viewMarket.repeatedPurchase'),
    content: <RepeatedPurchase filters={state} />,
  };
  const formActionsProps: ListActionsBlockProps = {
    actions: [oneTimePurchase, repeatedPurchase],
  };

  const sellOffers: ListAction = {
    name: t('exchange.viewMarket.sellOffers'),
    content: <SellOffers asks={orderbookData.asks} isLoading={isLoading} />,
  };
  const buyOffers: ListAction = {
    name: t('exchange.viewMarket.buyOffers'),
    content: <BuyOffers bids={orderbookData.bids} isLoading={isLoading} />,
  };
  const tradingView: ListAction = {
    name: t('exchange.viewMarket.tradingView'),
    content: (
      <TradingView orderBookData={orderbookData} isLoading={isLoading} />
    ),
  };

  const tablesActionsProps: ListActionsBlockProps = {
    actions: [sellOffers, buyOffers, tradingView],
  };

  const formTitle = t('exchange.viewMarket.market');

  return { state, dispatch, formActionsProps, formTitle, tablesActionsProps };
};
