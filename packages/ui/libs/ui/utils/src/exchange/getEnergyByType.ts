// import { Bundle, EnergyTypeEnum, IEnvironment } from './../types';
// import { getDeviceById } from '../device';
// import { first } from 'lodash';
// import { BigNumber } from 'ethers';

// export const getEnergyByType = (
//   bundle: Bundle,
//   devices,
//   types: Array<EnergyTypeEnum> = Object.values(EnergyTypeEnum),
//   environment: IEnvironment
// ) => {
//   return bundle.items.reduce(
//     (grouped, item) => {
//       const device = getDeviceById(item.asset.deviceId, devices, environment);
//       const type = device
//         ? (first<string>(
//             device.deviceType.split(';')
//           ).toLowerCase() as EnergyTypeEnum)
//         : EnergyTypeEnum.SOLAR;
//       const propName = grouped[type] ? type : 'other';
//       grouped[propName] = grouped[propName].add(item.currentVolume);
//       grouped.total = grouped.total.add(item.currentVolume);
//       return grouped;
//     },
//     types.reduce((acc, type) => ({ ...acc, [type]: BigNumber.from(0) }), {
//       total: BigNumber.from(0),
//       other: BigNumber.from(0),
//     })
//   );
// };
