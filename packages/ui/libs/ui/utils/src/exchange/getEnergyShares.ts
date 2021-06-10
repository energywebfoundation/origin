import { EnergyTypeEnum } from '../types';
import { BigNumber } from 'ethers';
import { EnergyFormatter } from '../formatters';
import { getEnergyByType } from './getEnergyByType';
import { BundlePublicDTO } from '@energyweb/exchange-react-query-client';

export const getEnergyShares = (
  bundle: BundlePublicDTO['items'],
  devices,
  types: Array<EnergyTypeEnum>
) => {
  const energy = getEnergyByType(bundle, devices, types);
  return Object.fromEntries(
    Object.keys(energy)
      .filter((p) => p !== 'total')
      .map((p) => [p, energy[p].mul(BigNumber.from(10000)).div(energy.total)])
      .map(([p, v]) => {
        return [p, `${v.div(100).toFixed(2)}%`];
      })
      .concat([['total', EnergyFormatter.format(energy.total, true)]])
  );
};
