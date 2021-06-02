import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as IconWind } from '../../../assets/device/icon-wind.svg';
import { ReactComponent as IconHydro } from '../../../assets/device/icon-hydro.svg';
import { ReactComponent as IconThermal } from '../../../assets/device/icon-thermal.svg';
import { ReactComponent as IconSolid } from '../../../assets/device/icon-solid.svg';
import { ReactComponent as IconLiquid } from '../../../assets/device/icon-liquid.svg';
import { ReactComponent as IconGaseous } from '../../../assets/device/icon-gaseous.svg';
import { ReactComponent as IconMarine } from '../../../assets/device/icon-marine.svg';
import { ReactComponent as IconSolar } from '../../../assets/device/icon-solar.svg';
import { StringMap } from 'i18next';

const ElementsDictionary: Record<string, JSX.Element> = {
  Wind: <IconWind />,
  'Hydro-electric Head': <IconHydro />,
  Thermal: <IconThermal />,
  Solid: <IconSolid />,
  Liquid: <IconLiquid />,
  Gaseous: <IconGaseous />,
  Marine: <IconMarine />,
};

const tooltipDictionary: Record<string, [string, StringMap]> = {
  Thermal: ['general.feedback.createdByNoun', { fullName: 'Adam Terpening' }],
  Solid: ['general.feedback.createdByNoun', { fullName: 'ahmad' }],
  Liquid: ['general.feedback.createdByNoun', { fullName: 'BomSymbols' }],
  Gaseous: ['general.feedback.createdByNoun', { fullName: 'Deadtype' }],
  Marine: ['general.feedback.createdByNoun', { fullName: 'Vectors Point' }],
};

function matchFragment<T>(
  fragment: string,
  source: Record<string, T>,
  defaultValue: T
): T {
  for (const key in source) {
    if (fragment.startsWith(key)) {
      return source[key];
    }
  }
  return defaultValue;
}

export function DeviceIcon(props: {
  type: string;
  className: string;
}): JSX.Element {
  const { t } = useTranslation();
  const { type, className } = props;

  const getTooltip = (): string => {
    const data = matchFragment(type, tooltipDictionary, null);
    return data === null ? '' : t(...data);
  };

  return (
    <div className={className} title={getTooltip()}>
      {matchFragment(type, ElementsDictionary, <IconSolar />)}
    </div>
  );
}
