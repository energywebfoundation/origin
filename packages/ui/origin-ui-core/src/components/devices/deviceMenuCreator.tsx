import React from 'react';
import { TFunction } from 'i18next';
import { DeviceStatus, IUser, isRole, Role } from '@energyweb/origin-backend-core';
import { OriginFeature } from '@energyweb/utils-general';
import { ProducingDeviceTable } from './ProducingDevice/ProducingDeviceTable';
import { DeviceMap } from './DeviceMap';
import { DeviceGroupForm } from './DeviceGroupForm';
import { AddDevice } from './AddDevice';
import { ImportDevice } from './ImportDevice/ImportDevices';

interface IDeviceMenuItem {
    key: string;
    label: string;
    component: React.ReactType;
    show: boolean;
    features: OriginFeature[];
}

export const deviceMenuCreator = (user: IUser, t: TFunction): IDeviceMenuItem[] => {
    function MyDevices() {
        return (
            <ProducingDeviceTable
                owner={user?.id}
                showAddDeviceButton={true}
                actions={{
                    requestCertificates: true
                }}
            />
        );
    }

    function ProductionList() {
        return (
            <ProducingDeviceTable
                hiddenColumns={['status']}
                includedStatuses={[DeviceStatus.Active]}
                actions={{}}
            />
        );
    }

    function ProductionPendingList() {
        return (
            <ProducingDeviceTable
                includedStatuses={[DeviceStatus.Submitted]}
                actions={{
                    approve: true
                }}
            />
        );
    }

    const Map = () => <DeviceMap height="700px" />;

    const isDeviceManagerOrAdmin = () =>
        user?.organization && isRole(user, Role.OrganizationDeviceManager, Role.OrganizationAdmin);

    return [
        {
            key: 'production',
            label: t('navigation.devices.all'),
            component: ProductionList,
            features: [OriginFeature.Devices],
            show: true
        },
        {
            key: 'production-map',
            label: t('navigation.devices.map'),
            component: Map,
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
            component: ProductionPendingList,
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
            show: isDeviceManagerOrAdmin()
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
