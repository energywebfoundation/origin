import { Bundle, EnergyTypeEnum } from '../types';
import { first } from 'lodash';
import { BigNumber } from 'ethers';
import { getDeviceById } from '@energyweb/origin-ui-device-logic';
import { BundlePublicDTO } from '@energyweb/exchange-react-query-client';

export const getEnergyByType = (
  bundleItems: BundlePublicDTO['items'],
  devices,
  types: Array<EnergyTypeEnum> = Object.values(EnergyTypeEnum)
) => {
  return bundleItems.reduce(
    (grouped, item) => {
      const device = getDeviceById(
        item.asset.deviceId,
        devices,
        process.env.NX_ISSUER_ID
      );
      const type = device
        ? (first<string>(
            device.deviceType.split(';')
          ).toLowerCase() as EnergyTypeEnum)
        : EnergyTypeEnum.SOLAR;
      const propName = grouped[type] ? type : 'other';
      grouped[propName] = grouped[propName].add(item.currentVolume);
      grouped.total = grouped.total.add(item.currentVolume);
      return grouped;
    },
    types.reduce((acc, type) => ({ ...acc, [type]: BigNumber.from(0) }), {
      total: BigNumber.from(0),
      other: BigNumber.from(0),
    })
  );
};
