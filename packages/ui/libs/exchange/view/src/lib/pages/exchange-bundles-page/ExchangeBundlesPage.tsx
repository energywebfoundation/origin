import React from 'react';

import {
  ITableSortConfig,
  TableComponent,
  TableRowData,
} from '@energyweb/origin-ui-core';
import { useExchangeBundlesPageEffects } from './ExchangeBundlesPage.effects';
import { BundlePublicDTO } from '@energyweb/exchange-react-query-client';
import {
  EnergyTypeEnum,
  getEnergyShares,
  toBN,
} from '@energyweb/origin-ui-utils';

enum EnergyTypes {
  GASEOUS = 'gaseous',
  HYDRO = 'hydro-electric head',
  LIQUID = 'liquid',
  SOLAR = 'solar',
  SOLID = 'solid',
  THERMAL = 'thermal',
  WIND = 'wind',
  MARINE = 'marine',
}

interface IExchangeBundlesTableRowDataConfig extends TableRowData<number> {
  total: string;
  [EnergyTypes.SOLAR]: string;
  [EnergyTypes.WIND]: string;
  [EnergyTypes.HYDRO]: string;
}

/* eslint-disable-next-line */
export interface ExchangeBundlesPageProps {}

const sortConfig: ITableSortConfig<typeof columns> = {
  sortableColumns: { total: { sortOrder: 'ASC' } },
};

const columns: {
  [k in keyof Omit<IExchangeBundlesTableRowDataConfig, 'id'>];
} = {
  total: 'bundle.properties.total_energy',
  [EnergyTypes.SOLAR]: 'bundle.properties.solar',
  [EnergyTypes.WIND]: 'bundle.properties.wind',
  [EnergyTypes.HYDRO]: 'bundle.properties.hydro',
  other: 'bundle.properties.other',
  price: 'bundle.properties.price',
};
export const ExchangeBundlesPage = (props: ExchangeBundlesPageProps) => {
  const { isLoading, data } = useExchangeBundlesPageEffects();

  return (
    <TableComponent
      sortConfig={sortConfig}
      loading={isLoading}
      data={data?.map(mapDataToTableRows)}
      header={columns}
    />
  );
};

const mapDataToTableRows = (
  el: BundlePublicDTO
): IExchangeBundlesTableRowDataConfig => {
  console.log(
    getEnergyShares(
      el.items,
      [],
      [EnergyTypeEnum.SOLAR, EnergyTypeEnum.WIND, EnergyTypeEnum.HYDRO]
    )
  );
  return {
    ...getEnergyShares(
      el.items,
      [],
      [EnergyTypeEnum.SOLAR, EnergyTypeEnum.WIND, EnergyTypeEnum.HYDRO]
    ),
    actions: [],
  };
};

export default ExchangeBundlesPage;
