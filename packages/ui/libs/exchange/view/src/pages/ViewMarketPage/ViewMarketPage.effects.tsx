import { ListAction, ListActionsBlockProps } from '@energyweb/origin-ui-core';
import React from 'react';
import { useReducer } from 'react';
import { OneTimePurchase } from '../../containers';
import { initialState, reducer } from './ViewMarketPage.reducer';

export const useViewMarketPageEffects = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const oneTimePurchase: ListAction = {
    name: 'One Time Purchase',
    content: <OneTimePurchase />,
  };

  const repeatedPurchase: ListAction = {
    name: 'Repeated Purchase',
    content: <div>Repeated Purchase</div>,
  };

  const listActionsProps: ListActionsBlockProps = {
    actions: [oneTimePurchase, repeatedPurchase],
    tabsProps: {
      variant: 'fullWidth',
    },
  };

  return { state, dispatch, listActionsProps };
};
