import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEnergyTypeImage,
  getMainFuelType,
  getOwnedOrderStyles,
} from '../utils';
import { TFormatBids, TUseBuyOffersTableLogic } from './types';

export const formatBids: TFormatBids = ({ bids, allFuelTypes }) => {
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
      gridOperator: bid.product.gridOperator
        ? bid.product.gridOperator[0]
        : '-',
      generationStart: bid.product.generationFrom
        ? formatDate(bid.product.generationFrom)
        : '-',
      generationEnd: bid.product.generationTo
        ? formatDate(bid.product.generationTo)
        : '-',
    };
  });
};

export const useBuyOffersTableLogic: TUseBuyOffersTableLogic = ({
  bids,
  allFuelTypes,
  isLoading,
  user,
  className,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      fuelType: t('exchange.viewMarket.type'),
      volume: t('exchange.viewMarket.volume'),
      price: t('exchange.viewMarket.price'),
      gridOperator: t('exchange.viewMarket.gridOperator'),
      generationStart: t('exchange.viewMarket.generationStart'),
      generationEnd: t('exchange.viewMarket.generationEnd'),
    },
    loading: isLoading,
    getCustomRowClassName: getOwnedOrderStyles(bids, user?.id, className),
    data: formatBids({ bids, allFuelTypes }) ?? [],
  };
};
