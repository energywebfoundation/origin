import { ListAction, ListActionsBlockProps } from '@energyweb/origin-ui-core';
import React from 'react';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { OneTimePurchase, RepeatedPurchase } from '../../containers';
import { initialState, reducer } from './ViewMarketPage.reducer';

export const useViewMarketPageEffects = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();

  const oneTimePurchase: ListAction = {
    name: t('exchange.viewMarket.oneTimePurchase'),
    content: <OneTimePurchase filters={state} />,
  };

  const repeatedPurchase: ListAction = {
    name: t('exchange.viewMarket.repeatedPurchase'),
    content: <RepeatedPurchase filters={state} />,
  };

  const listActionsProps: ListActionsBlockProps = {
    actions: [oneTimePurchase, repeatedPurchase],
    tabsProps: {
      variant: 'fullWidth',
    },
  };

  return { state, dispatch, listActionsProps };
};
