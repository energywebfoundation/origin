import solar from '../../assets/icon_solar.svg';
import wind from '../../assets/icon_wind.svg';
import hydro from '../../assets/icon_hydro.svg';
import iconThermal from '../../assets/icon_thermal.svg';
import iconSolid from '../../assets/icon_solid.svg';
import iconLiquid from '../../assets/icon_liquid.svg';
import iconGaseous from '../../assets/icon_gaseous.svg';
import iconMarine from '../../assets/icon_marine.svg';
import { useTranslation } from '../utils';
import React from 'react';

export function DeviceIcon(props: { type: string; className: string }): JSX.Element {
    const { t } = useTranslation();
    const { type, className } = props;
    let image = solar;
    let tooltip = '';

    if (type.startsWith('Wind')) {
        image = wind;
    } else if (type.startsWith('Hydro-electric Head')) {
        image = hydro;
    } else if (type.startsWith('Thermal')) {
        image = iconThermal;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Adam Terpening' });
    } else if (type.startsWith('Solid')) {
        image = iconSolid;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'ahmad' });
    } else if (type.startsWith('Liquid')) {
        image = iconLiquid;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'BomSymbols' });
    } else if (type.startsWith('Gaseous')) {
        image = iconGaseous;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Deadtype' });
    } else if (type.startsWith('Marine')) {
        image = iconMarine;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Vectors Point' });
    }

    return <img src={image} alt={tooltip} className={className} />;
}
