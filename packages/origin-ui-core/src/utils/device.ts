import { ProducingDevice } from '@energyweb/device-registry';
import { IEnvironment } from '../features/general/actions';
import { CustomFilterInputType, ICustomFilterDefinition } from '../components/Table/FiltersHeader';

type TranslateFunc = (key: string) => string;

export function getDeviceId(device: ProducingDevice.Entity, environment: IEnvironment) {
    return (
        device.externalDeviceIds?.find((i) => i.type === environment.ISSUER_ID)?.id ??
        device.id?.toString()
    );
}

export const LOCATION_TITLE_TRANSLATION_KEY = 'device.properties.regionProvince';
export const GRID_OPERATOR_TITLE_TRANSLATION_KEY = 'device.properties.gridOperator';

export function getDeviceLocationText(device: ProducingDevice.Entity) {
    return [device?.region, device?.province].filter((i) => i).join(', ');
}

export function getDeviceGridOperatorText(device: ProducingDevice.Entity) {
    return device.gridOperator.split(';').join(' ');
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
