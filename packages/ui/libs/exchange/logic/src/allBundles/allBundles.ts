import { BundlePublicDTO } from '@energyweb/exchange-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { TableComponentProps } from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';
import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { getBundleEnergyShares } from '../utils';

type TUseAllBundlesTablesLogicArgs = {
  isLoading: boolean;
  allBundles: BundlePublicDTO[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
  openDetailsModal: (bundle: BundlePublicDTO) => void;
};

export type TUseAllBundlesTablesLogic = (
  args: TUseAllBundlesTablesLogicArgs
) => TableComponentProps<BundlePublicDTO['id']>;

export const useAllBundlesTablesLogic: TUseAllBundlesTablesLogic = ({
  isLoading,
  allBundles,
  allDevices,
  allFuelTypes,
  openDetailsModal,
}) => {
  const { t } = useTranslation();

  const handleRowClick = (id: BundlePublicDTO['id']) => {
    const bundleToShow = allBundles.find((bundle) => bundle.id === id);
    openDetailsModal(bundleToShow);
  };

  return {
    tableTitle: t('exchange.allBundles.tableTitle'),
    tableTitleProps: { variant: 'h5', gutterBottom: true },
    pageSize: 25,
    header: {
      total: t('exchange.allBundles.totalEnergy'),
      solar: t('exchange.allBundles.solar'),
      wind: t('exchange.allBundles.wind'),
      [EnergyTypeEnum.HYDRO]: t('exchange.allBundles.hydro'),
      other: t('exchange.allBundles.other'),
      price: t('exchange.allBundles.price'),
    },
    loading: isLoading,
    onRowClick: handleRowClick,
    data:
      allBundles?.map((bundle) => ({
        id: bundle.id,
        price: `$ ${BigNumber.from(bundle.price)
          .div(BigNumber.from(100))
          .toNumber()
          .toFixed(2)
          .toString()}`,
        ...getBundleEnergyShares(bundle, allDevices, allFuelTypes),
      })) || [],
  };
};
