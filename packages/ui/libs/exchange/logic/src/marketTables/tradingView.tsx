import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { uniqBy } from 'lodash';
import {
  getEnergyTypeImage,
  getMainFuelType,
  getOwnedOrderStyles,
} from '../utils';
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
  user,
  className,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      fuelType: t('exchange.viewMarket.type'),
      volume: t('exchange.viewMarket.volume'),
      price: t('exchange.viewMarket.price'),
    },
    loading: isLoading,
    getCustomRowClassName: getOwnedOrderStyles(asks, user?.id, className),
    data: formatAsksForTradingView({ asks, allFuelTypes }) ?? [],
  };
};

export const formatBidsForTradingView: TFormatBidsForTradingView = ({
  bids,
  allFuelTypes,
}) => {
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
    };
  });
};
export const useBidsTableLogic: TUseBidsTableLogic = ({
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
    },
    loading: isLoading,
    getCustomRowClassName: getOwnedOrderStyles(bids, user?.id, className),
    data: formatBidsForTradingView({ bids, allFuelTypes }) ?? [],
  };
};
