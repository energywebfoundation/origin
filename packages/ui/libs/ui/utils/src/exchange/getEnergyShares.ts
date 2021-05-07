// import { Bundle, EnergyTypeEnum, IEnvironment } from '../types';
// import { BigNumber } from 'ethers';
// import { EnergyFormatter } from '../formatters';
// import { getEnergyByType } from './getEnergyByType';

// export const getEnergyShares = (
//   bundle: Bundle,
//   devices,
//   types: Array<EnergyTypeEnum>,
//   environment: IEnvironment
// ) => {
//   const energy = getEnergyByType(bundle, devices, types, environment);
//   return Object.fromEntries(
//     Object.keys(energy)
//       .filter((p) => p !== 'total')
//       .map((p) => [p, energy[p].mul(BigNumber.from(10000)).div(energy.total)])
//       .map(([p, v]) => {
//         return [p, `${v.div(100).toFixed(2)}%`];
//       })
//       .concat([['total', EnergyFormatter.format(energy.total, true)]])
//   );
// };
