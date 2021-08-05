import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { Button, useTheme, Tooltip } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEnergyTypeImage,
  getMainFuelType,
  getOwnedOrderStyles,
} from '../utils';
import { TFormatAsks, TUseSellOffersTableLogic } from './types';

export const formatAsks: TFormatAsks = ({
  t,
  asks,
  allFuelTypes,
  user,
  onBuyClick,
  primaryColor,
}) => {
  return asks?.map((ask) => {
    const fuelCode = ask.product.deviceType[0].split(';')[0];
    const { mainType } = getMainFuelType(fuelCode, allFuelTypes);
    const Icon = getEnergyTypeImage(mainType as EnergyTypeEnum);
    const buyText = t('exchange.viewMarket.buy');

    return {
      id: ask.id,
      fuelType: (
        <Tooltip title={mainType}>
          <Icon style={{ width: 20, fill: primaryColor }} />
        </Tooltip>
      ),
      volume: PowerFormatter.format(parseInt(ask.volume)),
      price: ask.price / 100,
      gridOperator: ask.product.gridOperator[0],
      generationStart: formatDate(ask.product.generationFrom),
      generationEnd: formatDate(ask.product.generationTo),
      buyDirect:
        user?.id?.toString() !== ask.userId ? (
          <Button variant="contained" onClick={() => onBuyClick(ask.id)}>
            {buyText}
          </Button>
        ) : null,
    };
  });
};

export const useSellOffersTableLogic: TUseSellOffersTableLogic = ({
  asks,
  allFuelTypes,
  isLoading,
  user,
  className,
  onBuyClick,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  return {
    header: {
      fuelType: t('exchange.viewMarket.type'),
      volume: t('exchange.viewMarket.volume'),
      price: t('exchange.viewMarket.price'),
      gridOperator: t('exchange.viewMarket.gridOperator'),
      generationStart: t('exchange.viewMarket.generationStart'),
      generationEnd: t('exchange.viewMarket.generationEnd'),
      buyDirect: t('exchange.viewMarket.buyDirect'),
    },
    getCustomRowClassName: getOwnedOrderStyles(asks, user?.id, className),
    loading: isLoading,
    data:
      formatAsks({ t, asks, user, allFuelTypes, onBuyClick, primaryColor }) ??
      [],
  };
};
