import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { isRole, IUser, Role } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { AllDevices } from './containers/Device/AllDevices';
import { ProductionMap } from './containers/Device/ProductionMap';
import { MyDevices } from './containers/Device/MyDevices';
import { PendingDevices } from './containers/Device/PendingDevices';
import { RegisterDevice } from './containers/Device/RegisterDevice';
import { ImportDevice } from './containers/Device/ImportDevice';
import { fromUsersSelectors } from '@energyweb/origin-ui-core';

interface IDeviceMenuItem {
    key: string;
    label: string;
    component: React.ElementType;
    show: boolean;
    features: OriginFeature[];
}

const isDeviceManagerOrAdmin = (user: IUser): boolean =>
    user?.organization && isRole(user, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

export function useDeviceMenu(): IDeviceMenuItem[] {
    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const { t } = useTranslation();

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
            component: ProductionMap,
            features: [OriginFeature.Devices],
            show: true
        },
        {
            key: 'owned',
            label: t('navigation.devices.my'),
            component: MyDevices,
            features: [OriginFeature.Devices, OriginFeature.Seller],
            show: isDeviceManagerOrAdmin(user)
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
            component: RegisterDevice,
            features: [OriginFeature.Devices, OriginFeature.Seller],
            show: isDeviceManagerOrAdmin(user)
        },
        // {
        //     key: 'add-group',
        //     label: t('navigation.devices.registerDeviceGroup'),
        //     component: RegisterDeviceGroup,
        //     features: [OriginFeature.Devices, OriginFeature.Seller],
        //     show: isDeviceManagerOrAdmin()
        // },
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
            features: [OriginFeature.Devices],
            show: true
        }
    ];
}
