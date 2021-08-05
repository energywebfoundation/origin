import { OrderBookOrderDTO } from '@energyweb/exchange-irec-react-query-client';
import {
  useCachedAllFuelTypes,
  useCachedUser,
} from '@energyweb/origin-ui-exchange-data';
import { useBuyOffersTableLogic } from '@energyweb/origin-ui-exchange-logic';
import { useMediaQuery, useTheme } from '@material-ui/core';
import React from 'react';
import { MultipleDeviceIcons } from '../MultipleDeviceIcons';
import { useStyles } from './BuyOffers.styles';

export const useBuyOffersEffects = (
  bids: OrderBookOrderDTO[],
  isLoading: boolean
) => {
  const allFuelTypes = useCachedAllFuelTypes();
  const user = useCachedUser();
  const classes = useStyles();
  const tableLogic = useBuyOffersTableLogic({
    bids,
    isLoading,
    allFuelTypes,
    user,
    className: classes.owned,
  });
  const tableProps = {
    ...tableLogic,
    data: tableLogic.data.map((row) => {
      return {
        ...row,
        fuelType: <MultipleDeviceIcons iconsData={row.fuelType} id={row.id} />,
      };
    }),
  };

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down('md'));

  return { tableProps, mobileView };
};
