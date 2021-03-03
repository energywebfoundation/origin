/* eslint-disable camelcase, @typescript-eslint/no-unused-vars */
import { ProducingDevice } from '@energyweb/device-registry';
import { IEnvironment } from '../features/general/actions';
import { CustomFilterInputType, ICustomFilterDefinition } from '../components/Table/FiltersHeader';
import gaseous from '../../assets/device/icon-gaseous.svg';
import hydro from '../../assets/device/icon-hydro.svg';
import liquid from '../../assets/device/icon-liquid.svg';
import solar from '../../assets/device/icon-solar.svg';
import solid from '../../assets/device/icon-solid.svg';
import thermal from '../../assets/device/icon-thermal.svg';
import wind from '../../assets/device/icon-wind.svg';
import marine from '../../assets/device/icon-marine.svg';
import gaseous_selected from '../../assets/device_selected/icon-gaseous.svg';
import hydro_selected from '../../assets/device_selected/icon-hydro.svg';
import liquid_selected from '../../assets/device_selected/icon-liquid.svg';
import solar_selected from '../../assets/device_selected/icon-solar.svg';
import solid_selected from '../../assets/device_selected/icon-solid.svg';
import thermal_selected from '../../assets/device_selected/icon-thermal.svg';
import wind_selected from '../../assets/device_selected/icon-wind.svg';
import marine_selected from '../../assets/device_selected/icon-marine.svg';
import { IOriginDevice } from '../types';
import { DeviceDTO } from '@energyweb/origin-device-registry-irec-form-api-client';

type TranslateFunc = (key: string) => string;

export function getDeviceId(device: any, environment: IEnvironment) {
    return (
        device.externalDeviceIds?.find((i) => i.type === environment.ISSUER_ID)?.id ??
        device.id?.toString()
    );
}

export enum EnergyTypes {
    GASEOUS = 'gaseous',
    HYDRO = 'hydro-electric head',
    LIQUID = 'liquid',
    SOLAR = 'solar',
    SOLID = 'solid',
    THERMAL = 'thermal',
    WIND = 'wind',
    MARINE = 'marine'
}

export const LOCATION_TITLE_TRANSLATION_KEY = 'device.properties.regionProvince';
export const GRID_OPERATOR_TITLE_TRANSLATION_KEY = 'device.properties.gridOperator';

export function getDeviceLocationText(device: DeviceDTO) {
    return [device?.region, device?.province].filter((i) => i).join(', ');
}

export function getDeviceGridOperatorText(device: IOriginDevice) {
    return device?.gridOperator?.split(';')?.join(' ') || '';
}

interface IRecordWithLocationText {
    locationText: string;
}

interface IRecordWithGridOperatorText {
    gridOperatorText: string;
}

type TRecordLocationGetterFunc = (IRecordWithLocationText) => string;
type TRecordLGridOperatorGetterFunc = (IRecordWithGridOperatorText) => string;

export function isDeviceLocationEnabled(environment: IEnvironment) {
    return environment?.DEVICE_PROPERTIES_ENABLED?.includes('LOCATION');
}

export function isDeviceGridOperatorEnabled(environment: IEnvironment) {
    return environment?.DEVICE_PROPERTIES_ENABLED?.includes('GRID_OPERATOR');
}

export function getDeviceFilters(
    recordLocationGetter: TRecordLocationGetterFunc,
    recordGridOperatorGetter: TRecordLGridOperatorGetterFunc,
    environment: IEnvironment,
    t: TranslateFunc
): ICustomFilterDefinition[] {
    const filters = [];

    if (isDeviceLocationEnabled(environment)) {
        filters.push({
            property: recordLocationGetter,
            label: t(LOCATION_TITLE_TRANSLATION_KEY),
            input: {
                type: CustomFilterInputType.string
            }
        });
    }

    if (isDeviceGridOperatorEnabled(environment)) {
        filters.push({
            property: recordGridOperatorGetter,
            label: t(GRID_OPERATOR_TITLE_TRANSLATION_KEY),
            input: {
                type: CustomFilterInputType.string
            }
        });
    }

    return filters;
}

export function areDeviceSpecificPropertiesValid(
    location: string[],
    gridOperator: string[],
    environment: IEnvironment
) {
    let isValid = true;

    if (isDeviceLocationEnabled(environment)) {
        isValid = isValid && location?.length === 2;
    }

    if (isDeviceGridOperatorEnabled(environment)) {
        isValid = isValid && gridOperator?.length === 1;
    }

    return isValid;
}

type TDeviceColumn<T extends any> = {
    id: 'deviceLocation' | 'gridOperator';
    label: string;
    sortProperties?: ((record: T) => string)[];
};

export function getDeviceColumns<T extends any>(
    environment: IEnvironment,
    t: (string) => string,
    locationSortProperties?: ((T) => string)[],
    gridOperatorSortProperties?: ((T) => string)[]
) {
    const columns: TDeviceColumn<T>[] = [];

    if (isDeviceLocationEnabled(environment)) {
        columns.push({
            id: 'deviceLocation',
            label: t(LOCATION_TITLE_TRANSLATION_KEY),
            sortProperties: locationSortProperties
        });
    }

    if (isDeviceGridOperatorEnabled(environment)) {
        columns.push({
            id: 'gridOperator',
            label: t(GRID_OPERATOR_TITLE_TRANSLATION_KEY),
            sortProperties: gridOperatorSortProperties
        });
    }

    return columns;
}

export function getDeviceSpecificPropertiesSearchTitle(
    environment: IEnvironment,
    t: TranslateFunc
) {
    const location = isDeviceLocationEnabled(environment);
    const grid = isDeviceGridOperatorEnabled(environment);

    if (location && grid) {
        return t('search.searchByLocationAndGridOperator');
    }

    if (location) {
        return t('search.searchByLocation');
    }

    if (grid) {
        return t('search.searchByGridOperator');
    }

    return t('general.actions.search');
}

export const energyImageByType = (type: EnergyTypes, selected = false): any => {
    const images = {
        [EnergyTypes.GASEOUS]: { regular: gaseous, selected: gaseous_selected },
        [EnergyTypes.HYDRO]: { regular: hydro, selected: hydro_selected },
        [EnergyTypes.LIQUID]: { reguar: liquid, selected: liquid_selected },
        [EnergyTypes.SOLAR]: { regular: solar, selected: solar_selected },
        [EnergyTypes.SOLID]: { regular: solid, selected: solid_selected },
        [EnergyTypes.THERMAL]: { regular: thermal, selected: thermal_selected },
        [EnergyTypes.WIND]: { regular: wind, selected: wind_selected },
        [EnergyTypes.MARINE]: { reguar: marine, selected: marine_selected }
    };
    return images[type][selected ? 'selected' : 'regular'];
};
