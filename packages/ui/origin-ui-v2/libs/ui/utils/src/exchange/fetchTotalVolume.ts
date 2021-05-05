// import { DemandClient } from '@energyweb/exchange-irec-client';
// import { ICalculateVolumeData } from '../types';
// import { isEmpty } from 'lodash';
// import { EnergyFormatter } from '../formatters';
// import { toBN } from '../index';

// export async function fetchTotalVolume(
//   client: DemandClient,
//   values: ICalculateVolumeData
// ) {
//   const { volume, period, start, end } = values;
//   const parsedVolume = toBN(volume);

//   if (
//     parsedVolume.gt(0) &&
//     [period, start, end].every((val) => !isEmpty(val))
//   ) {
//     const { data: summary } = await client.summary({
//       price: 100,
//       volumePerPeriod: String(
//         EnergyFormatter.getBaseValueFromValueInDisplayUnit(Number(parsedVolume))
//       ),
//       periodTimeFrame: period,
//       start: start.toISOString(),
//       end: start.toISOString(),
//       product: {},
//       boundToGenerationTime: false,
//       excludeEnd: false,
//     });
//     return EnergyFormatter.format(Number(summary.volume));
//   } else {
//     return '';
//   }
// }
