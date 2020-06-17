import { ProducingDevice } from '@energyweb/device-registry';
import { IEnvironment } from '../features/general/actions';
import { CustomFilterInputType, ICustomFilterDefinition } from '../components/Table/FiltersHeader';
import { getUserOffchain } from '../features/users/selectors';
import { useSelector } from 'react-redux';
import { useTranslation } from '.';
import { OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';

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

export interface IDevicePermissionRule {
    label: string;
    passing: boolean;
}

export interface IDevicePermission {
    value: boolean;
    rules: IDevicePermissionRule[];
}

export function useDevicePermissions() {
    const user = useSelector(getUserOffchain);
    const { t } = useTranslation();

    const canCreateDevice: IDevicePermission = {
        value: false,
        rules: [
            {
                label: t('general.feedback.haveToBeLoggedInUser'),
                passing: Boolean(user)
            },
            {
                label: t('general.feedback.hasToBeActiveUser'),
                passing: user?.status === UserStatus.Active
            },
            {
                label: t('general.feedback.userHasToBePartOfApprovedOrganization'),
                passing:
                    Boolean(user?.organization) &&
                    user?.organization?.status === OrganizationStatus.Active
            },
            {
                label: t('general.feedback.userHasToHaveBlockchainAccount'),
                passing: Boolean(user?.blockchainAccountAddress)
            }
        ]
    };

    canCreateDevice.value = canCreateDevice.rules.every((r) => r.passing);

    return {
        canCreateDevice
    };
}

export const deviceById = (
    id: string,
    environment: IEnvironment,
    devices: ProducingDevice.Entity[]
): ProducingDevice.Entity => {
    return devices.find((d) => {
        const deviceId = getDeviceId(d, environment);
        return deviceId === id;
    });
};

export const energyImageByType = (type: string) => {
    const images = {
        gaseous: '../../../assets/icon_gaseouse.svg',
        hydro: '../../../assets/icon_hydro.svg',
        liquid: '../../../assets/icon_liquid.svg',
        marine: '../../../assets/icon_marine.svg',
        solar: '../../../assets/icon_solar.svg',
        solid: '../../../assets/icon_solid.svg',
        thermal: '../../../assets/icon_thermal.svg',
        wind: '../../../assets/icon_wind.svg'
    };
    return images[type.toLowerCase()];
};
