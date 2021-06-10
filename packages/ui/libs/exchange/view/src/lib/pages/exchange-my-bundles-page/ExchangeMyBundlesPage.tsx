import React from 'react';

import { TableComponent, TableRowData } from '@energyweb/origin-ui-core';
import { Bundle } from '@energyweb/exchange-react-query-client';
import { useExchangeMyBundlesPageEffects } from './ExchangeMyBundlesPage.effects';
import { EnergyTypeEnum, getEnergyShares } from '@energyweb/origin-ui-utils';

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

interface IExchangeMyBundlesTableRowDataConfig extends TableRowData<number> {
  total: string;
  [EnergyTypeEnum.SOLAR]: string;
  [EnergyTypeEnum.WIND]: string;
  [EnergyTypeEnum.HYDRO]: string;
}

/* eslint-disable-next-line */
export interface ExchangeMyBundlesPageProps {}

const columns: {
  [k in keyof Omit<IExchangeMyBundlesTableRowDataConfig, 'id'>];
} = {
  total: 'bundle.properties.total_energy',
  [EnergyTypeEnum.SOLAR]: 'bundle.properties.solar',
  [EnergyTypeEnum.WIND]: 'bundle.properties.wind',
  [EnergyTypeEnum.HYDRO]: 'bundle.properties.hydro',
  other: 'bundle.properties.other',
  price: 'bundle.properties.price',
};

export const ExchangeMyBundlesPage = (props: ExchangeMyBundlesPageProps) => {
  const { isLoading, myBundles, myDevices } = useExchangeMyBundlesPageEffects();
  return (
    <TableComponent
      loading={isLoading}
      data={myBundles?.map(mapDataToTableRows.bind(null, myDevices))}
      header={columns}
    />
  );
};

const mapDataToTableRows = (
  devices,
  el: Bundle
): IExchangeMyBundlesTableRowDataConfig => {
  return {
    ...getEnergyShares(el.items, devices, [
      EnergyTypeEnum.SOLAR,
      EnergyTypeEnum.WIND,
      EnergyTypeEnum.HYDRO,
    ]),
    actions: [],
  };
};

export default ExchangeMyBundlesPage;
