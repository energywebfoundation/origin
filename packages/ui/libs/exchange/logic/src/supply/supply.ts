import { useTranslation } from 'react-i18next';
import { SupplyDto } from '@energyweb/exchange-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';
import { SupplyStatus } from '@energyweb/origin-ui-exchange-logic';
import { TUseLogicSupply, TFormatSupplyData } from './types';

const formatSupplyData: TFormatSupplyData = ({
  devices,
  supplies,
  allFuelTypes,
  actions,
}) => {
  return (
    devices?.map((device) => {
      const matchingSupply =
        supplies?.find((supply) => supply?.deviceId === device.id) ||
        ({} as SupplyDto);

      const price = isNaN(matchingSupply.price)
        ? '0.00'
        : matchingSupply.price.toFixed(2).toString();

      return {
        id: device?.externalRegistryId,
        fuelType:
          allFuelTypes?.find((type) => type.code === device?.fuelType)?.name ||
          '',
        facilityName: device?.name,
        price: `$${price}`,
        status: matchingSupply.active
          ? SupplyStatus.Active
          : SupplyStatus.Paused,
        toBeCertified: 0,
        actions,
      };
    }) || ([] as ComposedPublicDevice[])
  );
};

export const useLogicSupply: TUseLogicSupply = ({
  devices,
  supplies,
  allFuelTypes,
  actions,
  loading,
}) => {
  const { t } = useTranslation();
  return {
    header: {
      fuelType: t('exchange.supply.fuelType'),
      facilityName: t('exchange.supply.facilityName'),
      price: t('exchange.supply.price'),
      status: t('exchange.supply.status'),
      toBeCertified: t('exchange.supply.toBeCertifiedFor', {
        yearToDisplay: '2020/2021',
      }),
      actions: '',
    },
    pageSize: 10,
    loading: loading,
    data: formatSupplyData({
      devices,
      supplies,
      allFuelTypes,
      actions,
    }),
  };
};
