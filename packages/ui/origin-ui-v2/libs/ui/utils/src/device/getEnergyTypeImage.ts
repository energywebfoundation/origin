// import gaseous from '*.svg';
// import gaseous_selected from '*.svg';
// import hydro from '*.svg';
// import hydro_selected from '*.svg';
// import liquid from '*.svg';
// import liquid_selected from '*.svg';
// import solar from '*.svg';
// import solar_selected from '*.svg';
// import solid from '*.svg';
// import solid_selected from '*.svg';
// import thermal from '*.svg';
// import thermal_selected from '*.svg';
// import wind from '*.svg';
// import wind_selected from '*.svg';
// import marine from '*.svg';
// import marine_selected from '*.svg';
import { EnergyTypeEnum } from './../types';

export const getEnergyTypeImage = (type: EnergyTypeEnum, selected = false) => {
  // const images: {
  //   [k: string]: { regular: string; selected: string };
  // } = {
  //   [EnergyTypeEnum.GASEOUS]: { regular: gaseous, selected: gaseous_selected },
  //   [EnergyTypeEnum.HYDRO]: { regular: hydro, selected: hydro_selected },
  //   [EnergyTypeEnum.LIQUID]: { regular: liquid, selected: liquid_selected },
  //   [EnergyTypeEnum.SOLAR]: { regular: solar, selected: solar_selected },
  //   [EnergyTypeEnum.SOLID]: { regular: solid, selected: solid_selected },
  //   [EnergyTypeEnum.THERMAL]: { regular: thermal, selected: thermal_selected },
  //   [EnergyTypeEnum.WIND]: { regular: wind, selected: wind_selected },
  //   [EnergyTypeEnum.MARINE]: { regular: marine, selected: marine_selected },
  // };
  // const deviceType = type || EnergyTypeEnum.SOLAR;
  return 'true'; //images[deviceType][selected ? 'selected' : 'regular'];
};
