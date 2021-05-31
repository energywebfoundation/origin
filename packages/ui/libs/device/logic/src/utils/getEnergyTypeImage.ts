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

const images: {
  [k: string]: { regular: FC; selected: FC };
} = {
  [EnergyTypeEnum.WIND]: { regular: WindRegular, selected: WindSelected },
  [EnergyTypeEnum.SOLAR]: { regular: SolarRegular, selected: SolarSelected },
  [EnergyTypeEnum.HYDRO]: { regular: HydroRegular, selected: HydroSelected },
  [EnergyTypeEnum.MARINE_TIDAL]: {
    regular: MarineRegular,
    selected: MarineSelected,
  },
  [EnergyTypeEnum.MARINE_WAVE]: {
    regular: MarineRegular,
    selected: MarineSelected,
  },
  [EnergyTypeEnum.MARINE_CURRENT]: {
    regular: MarineRegular,
    selected: MarineSelected,
  },
  [EnergyTypeEnum.MARINE_VERTICAL]: {
    regular: MarineRegular,
    selected: MarineSelected,
  },
  [EnergyTypeEnum.RENEWABLE_HEAT]: {
    regular: ThermalRegular,
    selected: ThermalSelected,
  },
  [EnergyTypeEnum.BIOMASS_SOLID]: {
    regular: SolidRegular,
    selected: SolidSelected,
  },
  [EnergyTypeEnum.BIOMASS_LIQUID]: {
    regular: LiquidRegular,
    selected: LiquidSelected,
  },
  [EnergyTypeEnum.BIOGAS]: {
    regular: GaseousRegular,
    selected: GaseousSelected,
  },
  [EnergyTypeEnum.CO_FIRED_WITH_FOSSIL]: {
    regular: SolidRegular,
    selected: SolidSelected,
  },
};

export const getEnergyTypeImage = (type: EnergyTypeEnum, selected = false) => {
  const deviceType = type || EnergyTypeEnum.SOLAR;
  return images[deviceType][selected ? 'selected' : 'regular'];
};
