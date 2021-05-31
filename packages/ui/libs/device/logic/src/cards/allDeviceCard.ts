// import { ThailandFlag } from '@energyweb/origin-ui-assets';
// import { IconTextProps, SpecFieldProps } from '@energyweb/origin-ui-core';
// import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';
// import { useTranslation } from 'react-i18next';
// import { TUseSpecsForAllDeviceCard } from '../types';
// import {
//   getDeviceDetailedType,
//   useDeviceMainType,
//   getEnergyTypeImage,
// } from '../utils';

// export const useSpecsForAllDeviceCard: TUseSpecsForAllDeviceCard = ({
//   device
// }) => {
//   const { t } = useTranslation();

//   const specsData: SpecFieldProps[] = [
//     {
//       label: t('device.card.capacity'),
//       value: 12//PowerFormatter.format(device.capacityInW),
//     },
//     {
//       label: t('device.card.age'),
//       value: 'some'//getDeviceAgeInYears(device.operationalSince),
//     },
//   ];
//   const deviceMainType = useDeviceMainType(device);
//   const iconsData: IconTextProps[] = [
//     {
//       icon: getEnergyTypeImage(deviceMainType.toLowerCase() as EnergyTypeEnum),
//       title: deviceMainType,
//       subtitle: getDeviceDetailedType(device),
//     },
//     {
//       icon: ThailandFlag,
//       title: 'address'
//     },
//   ];

//   return { specsData, iconsData };
// };
