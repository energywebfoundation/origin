import React, { useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ListAction, ListActionsBlockProps } from '@energyweb/origin-ui-core';
import {
  OrderBookFilters,
  useApiOrderbookPoll,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import {
  OneTimePurchase,
  RepeatedPurchase,
  SellOffers,
  BuyOffers,
  TradingView,
} from '../../containers';
import {
  initialFiltersState,
  filtersReducer,
  MarketFilterActionEnum,
  MarketFiltersState,
} from './ViewMarketPage.reducer';
import { useLocation } from 'react-router-dom';

export const useViewMarketPageEffects = () => {
  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const { t } = useTranslation();
  const location = useLocation();
  const locationState = location.state as MarketFiltersState;

  useEffect(() => {
    if (!!locationState) {
      dispatch({
        type: MarketFilterActionEnum.SET_MARKET_FILTERS_STATE,
        payload: {
          fuelType: locationState.fuelType || initialFiltersState.fuelType,
          deviceType:
            locationState.deviceType || initialFiltersState.deviceType,
          regions: locationState.regions || initialFiltersState.regions,
          subregions:
            locationState.subregions || initialFiltersState.subregions,
          gridOperator:
            locationState.gridOperator || initialFiltersState.gridOperator,
          generationFrom:
            locationState.generationFrom || initialFiltersState.generationFrom,
          generationTo:
            locationState.generationTo || initialFiltersState.generationTo,
        },
      });
    }
  }, [locationState]);

  const filters: OrderBookFilters = {
    deviceType: state.deviceType.map((type) => type.value.toString()),
    gridOperator: state.gridOperator.map((type) => type.value.toString()),
    location: state.subregions.map((subregion) => subregion.value.toString()),
    generationDateStart: state.generationFrom?.toISOString(),
    generationDateEnd: state.generationTo?.toISOString(),
  };
  const user = useCachedUser();

  const { orderBookData, isLoading } = useApiOrderbookPoll(filters, user);

  const oneTimePurchase: ListAction = {
    name: t('exchange.viewMarket.oneTimePurchase'),
    content: <OneTimePurchase filters={state} dispatch={dispatch} />,
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
    content: <SellOffers asks={orderBookData.asks} isLoading={isLoading} />,
  };
  const buyOffers: ListAction = {
    name: t('exchange.viewMarket.buyOffers'),
    content: <BuyOffers bids={orderBookData.bids} isLoading={isLoading} />,
  };
  const tradingView: ListAction = {
    name: t('exchange.viewMarket.tradingView'),
    content: (
      <TradingView orderBookData={orderBookData} isLoading={isLoading} />
    ),
  };

  const tablesActionsProps: ListActionsBlockProps = {
    actions: [sellOffers, buyOffers, tradingView],
  };

  const formTitle = t('exchange.viewMarket.market');

  return { state, dispatch, formActionsProps, formTitle, tablesActionsProps };
};
