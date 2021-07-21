import { Bundle } from '@energyweb/exchange-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  TableActionData,
  TableComponentProps,
} from '@energyweb/origin-ui-core';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';
import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { getBundleEnergyShares } from '../utils';

type TUseMyBundlesTablesLogicArgs = {
  isLoading: boolean;
  myBundles: Bundle[];
  allDevices: ComposedPublicDevice[];
  allFuelTypes: CodeNameDTO[];
  actions: TableActionData<Bundle['id']>[];
  openDetailsModal: (bundle: Bundle) => void;
};

export type TUseMyBundlesTablesLogic = (
  args: TUseMyBundlesTablesLogicArgs
) => TableComponentProps<Bundle['id']>;

export const useMyBundlesTablesLogic: TUseMyBundlesTablesLogic = ({
  isLoading,
  myBundles,
  allDevices,
  allFuelTypes,
  actions,
  openDetailsModal,
}) => {
  const { t } = useTranslation();

  const handleRowClick = (id: Bundle['id']) => {
    const bundleToShow = myBundles.find((bundle) => bundle.id === id);
    openDetailsModal(bundleToShow);
  };

  return {
    tableTitle: t('exchange.myBundles.tableTitle'),
    tableTitleProps: { variant: 'h5', gutterBottom: true },
    pageSize: 25,
    loading: isLoading,
    onRowClick: handleRowClick,
    header: {
      total: t('exchange.myBundles.totalEnergy'),
      solar: t('exchange.myBundles.solar'),
      wind: t('exchange.myBundles.wind'),
      [EnergyTypeEnum.HYDRO]: t('exchange.myBundles.hydro'),
      other: t('exchange.myBundles.other'),
      price: t('exchange.myBundles.price'),
      actions: '',
    },
    data:
      myBundles?.map((bundle) => ({
        id: bundle.id,
        actions,
        price: `$ ${BigNumber.from(bundle.price)
          .div(BigNumber.from(100))
          .toNumber()
          .toFixed(2)
          .toString()}`,
        ...getBundleEnergyShares(bundle, allDevices, allFuelTypes),
      })) || [],
  };
};
