import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { isRole, Role, IUser } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { getUserOffchain } from '../../features';
import { AllDevices } from './AllDevices';
import { AllDevicesMap } from './AllDevicesMap';
import { MyDevices } from './MyDevices';
import { PendingDevices } from './PendingDevices';
import { AddDevice } from './AddDevice';
import { DeviceGroupForm } from './DeviceGroupForm';
import { ImportDevice } from './ImportDevice/ImportDevices';

interface IDeviceMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    features: OriginFeature[];
}

export const useDeviceMenu = (): IDeviceMenuItem[] => {
    const user: IUser = useSelector(getUserOffchain);
    const { t } = useTranslation();
    const isDeviceManagerOrAdmin = () =>
        user?.organization && isRole(user, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    return [
        {
            key: 'production',
            label: t('navigation.devices.all'),
            component: AllDevices,
            features: [OriginFeature.Devices],
            show: true
        },
        {
            key: 'production-map',
            label: t('navigation.devices.map'),
            component: AllDevicesMap,
            features: [OriginFeature.Devices],
            show: true
        },
        {
            key: 'owned',
            label: t('navigation.devices.my'),
            component: MyDevices,
            features: [OriginFeature.Devices, OriginFeature.Seller],
            show: isDeviceManagerOrAdmin()
        },
        {
            key: 'pending',
            label: t('navigation.devices.pending'),
            component: PendingDevices,
            features: [OriginFeature.Devices],
            show: isRole(user, Role.Issuer)
        },
        {
            key: 'add',
            label: t('navigation.devices.registerDevice'),
            component: AddDevice,
            features: [OriginFeature.Devices, OriginFeature.Seller],
            show: isDeviceManagerOrAdmin()
        },
        {
            key: 'add-group',
            label: t('navigation.devices.registerDeviceGroup'),
            component: DeviceGroupForm,
            features: [OriginFeature.Devices, OriginFeature.Seller],
            show: false
        },
        {
            key: 'producing_detail_view',
            label: 'Production detail',
            component: null,
            show: false,
            features: [OriginFeature.Devices]
        },
        {
            key: 'import',
            label: t('navigation.devices.import'),
            component: ImportDevice,
            features: [OriginFeature.DevicesImport],
            show: true
        }
    ];
};
