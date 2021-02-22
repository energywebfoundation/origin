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

export function DeviceIcon(props: { type: string; className: string }): JSX.Element {
    const { t } = useTranslation();
    const { type, className } = props;
    let SvgImage = <IconSolar />;
    let tooltip = '';

    if (type.startsWith('Wind')) {
        SvgImage = <IconWind />;
    } else if (type.startsWith('Hydro-electric Head')) {
        SvgImage = <IconHydro />;
    } else if (type.startsWith('Thermal')) {
        SvgImage = <IconThermal />;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Adam Terpening' });
    } else if (type.startsWith('Solid')) {
        SvgImage = <IconSolid />;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'ahmad' });
    } else if (type.startsWith('Liquid')) {
        SvgImage = <IconLiquid />;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'BomSymbols' });
    } else if (type.startsWith('Gaseous')) {
        SvgImage = <IconGaseous />;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Deadtype' });
    } else if (type.startsWith('Marine')) {
        SvgImage = <IconMarine />;
        tooltip = t('general.feedback.createdByNoun', { fullName: 'Vectors Point' });
    }

    return (
        <div className={className} data-tooltil={tooltip}>
            {SvgImage}
        </div>
    );
}
