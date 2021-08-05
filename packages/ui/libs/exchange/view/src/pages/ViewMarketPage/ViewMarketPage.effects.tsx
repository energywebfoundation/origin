import React, { useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ListAction, ListActionsBlockProps } from '@energyweb/origin-ui-core';
import { useApiOrderbookPoll } from '@energyweb/origin-ui-exchange-data';
import { usePermissions } from '@energyweb/origin-ui-utils';
import { useUserControllerMe } from '@energyweb/origin-backend-react-query-client';
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

  const { canAccessPage } = usePermissions();
  const { data: user, isLoading: isUserLoading } = useUserControllerMe();
  const { orderBookData, isLoading: isOrderbookLoading } = useApiOrderbookPoll(
    state,
    user
  );
  const isLoading = isUserLoading || isOrderbookLoading;

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

  return {
    state,
    dispatch,
    formActionsProps,
    formTitle,
    tablesActionsProps,
    canAccessPage,
    isLoading,
  };
};
