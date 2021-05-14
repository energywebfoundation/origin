import {
  GaseousRegular,
  GaseousSelected,
  HydroRegular,
  HydroSelected,
  LiquidRegular,
  LiquidSelected,
  SolarRegular,
  SolarSelected,
  SolidRegular,
  SolidSelected,
  ThermalRegular,
  ThermalSelected,
  WindRegular,
  WindSelected,
  MarineRegular,
  MarineSelected,
} from '@energyweb/origin-ui-assets';
import { EnergyTypeEnum } from '@energyweb/origin-ui-utils';
import { FC } from 'react';

export const getEnergyTypeImage = (type: EnergyTypeEnum, selected = false) => {
  const images: {
    [k: string]: { regular: FC; selected: FC };
  } = {
    [EnergyTypeEnum.GASEOUS]: {
      regular: GaseousRegular,
      selected: GaseousSelected,
    },
    [EnergyTypeEnum.HYDRO]: { regular: HydroRegular, selected: HydroSelected },
    [EnergyTypeEnum.LIQUID]: {
      regular: LiquidRegular,
      selected: LiquidSelected,
    },
    [EnergyTypeEnum.SOLAR]: { regular: SolarRegular, selected: SolarSelected },
    [EnergyTypeEnum.SOLID]: { regular: SolidRegular, selected: SolidSelected },
    [EnergyTypeEnum.THERMAL]: {
      regular: ThermalRegular,
      selected: ThermalSelected,
    },
    [EnergyTypeEnum.WIND]: { regular: WindRegular, selected: WindSelected },
    [EnergyTypeEnum.MARINE]: {
      regular: MarineRegular,
      selected: MarineSelected,
    },
  };
  const deviceType = type || EnergyTypeEnum.SOLAR;
  return images[deviceType][selected ? 'selected' : 'regular'];
};
