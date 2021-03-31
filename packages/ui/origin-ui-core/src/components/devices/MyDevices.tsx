import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserStatus } from '@energyweb/origin-backend-core';
import { getMyDevices, fetchMyDevices } from '../../features/devices';
import { usePermissions } from '../../utils/permissions';
import { TableFallback } from '../Table';
import { Requirements } from '../Layout';
import { DeviceTable } from './Table/DeviceTable';
import { fromGeneralSelectors, fromUsersSelectors } from '../../features';

export const MyDevices = () => {
    const dispatch = useDispatch();

    const user = useSelector(fromUsersSelectors.getUserOffchain);
    const userIsActive = user?.status === UserStatus.Active;

    const myDevices = useSelector(getMyDevices);
    const deviceClient = useSelector(fromGeneralSelectors.getBackendClient)?.deviceClient;

    const { canAccessPage } = usePermissions();

    useEffect(() => {
        if (deviceClient && userIsActive) {
            dispatch(fetchMyDevices());
        }
    }, [deviceClient, user]);

    if (!canAccessPage.value) {
        return <Requirements />;
    }

    if (myDevices === null) {
        return <TableFallback />;
    }

    return (
        <DeviceTable
            devices={myDevices}
            showAddDeviceButton={true}
            actions={{
                requestCertificates: true
            }}
        />
    );
};
