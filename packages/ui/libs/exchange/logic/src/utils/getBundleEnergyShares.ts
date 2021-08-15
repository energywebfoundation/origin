import {
  BundlePublicDTO,
  Bundle,
  BundlePublicItemDTO,
  BundleItem,
} from '@energyweb/exchange-react-query-client';
import { CodeNameDTO } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import { ComposedPublicDevice } from '@energyweb/origin-ui-exchange-data';
import { EnergyTypeEnum, PowerFormatter } from '@energyweb/origin-ui-utils';
import { BigNumber } from 'ethers';
import { getMainFuelType } from './getMainFuelType';

type TBundleItem = BundlePublicItemDTO | BundleItem;

export const getBundleEnergyShares = (
  bundle: BundlePublicDTO | Bundle,
  allDevices: ComposedPublicDevice[],
  allFuelTypes: CodeNameDTO[]
) => {
  if (!bundle || !allFuelTypes || !allDevices) {
    return {};
  }
  // @ts-ignore
  const energy = bundle.items.reduce(
    (grouped: any, item: any) => {
      const device = allDevices.find(
        (device) => device.externalRegistryId === item.asset.deviceId
      );
      const { mainType } = getMainFuelType(device?.fuelType, allFuelTypes);
      const propName = grouped[mainType.toLowerCase()]
        ? mainType.toLowerCase()
        : 'other';
      grouped[propName] = grouped[propName]?.add(item.currentVolume);
      grouped.total = grouped.total.add(item.currentVolume);
      return grouped;
    },
    {
      [EnergyTypeEnum.SOLAR]: BigNumber.from(0),
      [EnergyTypeEnum.WIND]: BigNumber.from(0),
      [EnergyTypeEnum.HYDRO]: BigNumber.from(0),
      total: BigNumber.from(0),
      other: BigNumber.from(0),
    }
  );

  const shares = Object.fromEntries(
    Object.keys(energy)
      .filter((p) => p !== 'total')
      .map((p) => [
        p,
        energy[p].mul(BigNumber.from(10000)).div((energy as any).total),
      ])
      .map(([p, v]) => {
        return [p, `${(v.toNumber() / 100).toFixed(2)}%`];
      })
      .concat([['total', PowerFormatter.format((energy as any).total, true)]])
  );

  return shares;
};
