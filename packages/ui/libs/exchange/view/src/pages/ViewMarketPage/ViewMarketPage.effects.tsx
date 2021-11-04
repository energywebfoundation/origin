import React, { useReducer, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ListAction, ListActionsBlockProps } from '@energyweb/origin-ui-core';
import dayjs from 'dayjs';
import {
  useAllDeviceFuelTypes,
  useAllDeviceTypes,
  useApiOrderbookPoll,
  useApiRegionsConfiguration,
  useUser,
} from '@energyweb/origin-ui-exchange-data';
import {
  getDeviceTypeOption,
  getFuelTypeOptions,
  getGridOperatorOptions,
  getRegionOption,
  getSubregionOption,
  ViewMarketRedirectFilters,
} from '@energyweb/origin-ui-exchange-logic';
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
} from '../../reducer';

export const useViewMarketPageEffects = () => {
  const [state, dispatch] = useReducer(filtersReducer, initialFiltersState);
  const [currentMarketTable, setCurrentMarketTable] = useState(0);
  const { t } = useTranslation();
  const { allTypes: allFuelTypes, isLoading: areFuelTypesLoading } =
    useAllDeviceFuelTypes();
  const { allTypes: allDeviceTypes, isLoading: areDeviceTypesLoading } =
    useAllDeviceTypes();
  const { allRegions, isLoading: areRegionsLoading } =
    useApiRegionsConfiguration();

  const location = useLocation();
  const locationState = location.state as ViewMarketRedirectFilters;

  useEffect(() => {
    if (locationState) {
      const fuelTypeOptions = locationState.deviceType
        ? getFuelTypeOptions(locationState.deviceType, allFuelTypes)
        : initialFiltersState.fuelType;

      const deviceTypeOptions = locationState.deviceType
        ? getDeviceTypeOption({
            deviceType: locationState.deviceType,
            fuelTypeOptions,
            allFuelTypes,
            allDeviceTypes,
          })
        : initialFiltersState.deviceType;

      const regionOptions = locationState.location
        ? getRegionOption(locationState.location, allRegions)
        : initialFiltersState.regions;

      const subregionOptions = locationState.location
        ? getSubregionOption(regionOptions, locationState.location, allRegions)
        : initialFiltersState.subregions;

      dispatch({
        type: MarketFilterActionEnum.SET_MARKET_FILTERS_STATE,
        payload: {
          fuelType: fuelTypeOptions,
          deviceType: deviceTypeOptions,
          regions: regionOptions,
          subregions: subregionOptions,
          gridOperator: locationState.gridOperator
            ? getGridOperatorOptions(locationState.gridOperator)
            : initialFiltersState.gridOperator,
          generationFrom: locationState.generationFrom
            ? dayjs(locationState.generationFrom)
            : initialFiltersState.generationFrom,
          generationTo: locationState.generationTo
            ? dayjs(locationState.generationTo)
            : initialFiltersState.generationTo,
        },
      });
    }
  }, [locationState]);

  useEffect(() => {
    return () => {
      dispatch({
        type: MarketFilterActionEnum.RESET_MARKET_FILTERS_STATE,
      });
    };
  }, []);

  const { user, userLoading } = useUser();
  const { orderBookData, isLoading: isOrderbookLoading } = useApiOrderbookPoll(
    state,
    user,
    currentMarketTable === 1
  );

  const isLoading =
    userLoading ||
    isOrderbookLoading ||
    areFuelTypesLoading ||
    areDeviceTypesLoading ||
    areRegionsLoading;

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
    selectedTab: currentMarketTable,
    setSelectedTab: setCurrentMarketTable,
  };

  const formTitle = t('exchange.viewMarket.market');

  return {
    state,
    dispatch,
    formActionsProps,
    formTitle,
    tablesActionsProps,
    isLoading,
  };
};
