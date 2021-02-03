import { TFunction } from 'i18next';
import { ComposedPublicDevice } from '../types';
import wind from '../../assets/icon_wind.svg';
import hydro from '../../assets/icon_hydro.svg';
import iconThermal from '../../assets/icon_thermal.svg';
import iconSolid from '../../assets/icon_solid.svg';
import iconLiquid from '../../assets/icon_liquid.svg';
import iconGaseous from '../../assets/icon_gaseous.svg';
import iconMarine from '../../assets/icon_marine.svg';
import solar from '../../assets/icon_solar.svg';

export function selectIconOnDeviceType(device: ComposedPublicDevice, t: TFunction) {
    const selectedDeviceType = device.deviceType;

    let tooltip = '';
    let image = solar;

    if (selectedDeviceType.startsWith('Wind')) {
        image = wind;
    } else if (selectedDeviceType.startsWith('Hydro-electric Head')) {
        image = hydro;
    } else if (selectedDeviceType.startsWith('Thermal')) {
        image = iconThermal;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Adam Terpening' });
    } else if (selectedDeviceType.startsWith('Solid')) {
        image = iconSolid;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'ahmad' });
    } else if (selectedDeviceType.startsWith('Liquid')) {
        image = iconLiquid;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'BomSymbols' });
    } else if (selectedDeviceType.startsWith('Gaseous')) {
        image = iconGaseous;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Deadtype' });
    } else if (selectedDeviceType.startsWith('Marine')) {
        image = iconMarine;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Vectors Point' });
    }
    return [tooltip, image];
}
