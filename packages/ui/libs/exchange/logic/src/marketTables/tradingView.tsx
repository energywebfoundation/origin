import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getEnergyTypeImage, getMainFuelType } from '../utils';
import {
  TFormatAsksForTradingView,
  TFormatBidsForTradingView,
  TUseAsksTableLogic,
  TUseBidsTableLogic,
} from './types';

export const formatAsksForTradingView: TFormatAsksForTradingView = ({
  asks,
  allFuelTypes,
}) => {
  return asks?.map((ask) => {
    const fuelCode = ask.product.deviceType[0].split(';')[0];
    const { mainType } = getMainFuelType(fuelCode, allFuelTypes);
    const Icon = getEnergyTypeImage(mainType as EnergyTypeEnum, true);

    return {
      id: ask.id,
      fuelType: <Icon style={{ width: 20 }} />,
      volume: PowerFormatter.format(parseInt(ask.volume)),
      price: ask.price / 100,
    };
  });
};

export const useAsksTableLogic: TUseAsksTableLogic = ({
  asks,
  allFuelTypes,
  isLoading,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      fuelType: t('exchange.viewMarket.type'),
      volume: t('exchange.viewMarket.volume'),
      price: t('exchange.viewMarket.price'),
    },
    loading: isLoading,
    data: formatAsksForTradingView({ asks, allFuelTypes }) ?? [],
  };
};

export const formatBidsForTradingView: TFormatBidsForTradingView = ({
  bids,
  allFuelTypes,
}) => {
  return bids?.map((bid) => {
    let Icon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> =
      null;

    if (!!bid.product.deviceType) {
      const fuelCode = bid.product.deviceType[0].split(';')[0];
      const { mainType } = getMainFuelType(fuelCode, allFuelTypes);
      Icon = getEnergyTypeImage(mainType as EnergyTypeEnum, true);
    }

    return {
      id: bid.id,
      fuelType: Icon ? (
        <Icon style={{ width: 20 }} />
      ) : (
        <Typography color="primary">ANY</Typography>
      ),
      volume: PowerFormatter.format(parseInt(bid.volume)),
      price: bid.price / 100,
    };
  });
};
export const useBidsTableLogic: TUseBidsTableLogic = ({
  bids,
  allFuelTypes,
  isLoading,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      fuelType: t('exchange.viewMarket.type'),
      volume: t('exchange.viewMarket.volume'),
      price: t('exchange.viewMarket.price'),
    },
    loading: isLoading,
    data: formatBidsForTradingView({ bids, allFuelTypes }) ?? [],
  };
};
