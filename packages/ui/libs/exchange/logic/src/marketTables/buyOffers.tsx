import {
  EnergyTypeEnum,
  formatDate,
  PowerFormatter,
} from '@energyweb/origin-ui-utils';
import React from 'react';
import { uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  getEnergyTypeImage,
  getMainFuelType,
  getOwnedOrderStyles,
} from '../utils';
import { TFormatBids, TUseBuyOffersTableLogic } from './types';

export const formatBids: TFormatBids = ({ bids, allFuelTypes }) => {
  return bids?.map((bid) => {
    let Icons: {
      label: string;
      icon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
    }[] = null;

    if (!!bid.product.deviceType) {
      const fuelCodes = bid.product.deviceType.map(
        (deviceType) => deviceType.split(';')[0]
      );
      const fuelTypeIcons = fuelCodes.map((fuelCode) => {
        const { mainType } = getMainFuelType(fuelCode, allFuelTypes);
        return {
          label: mainType,
          icon: getEnergyTypeImage(mainType as EnergyTypeEnum),
        };
      });
      const uniqueIcons = uniqBy(fuelTypeIcons, 'label');
      Icons = uniqueIcons;
    }

    return {
      id: bid.id,
      fuelType: Icons,
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
