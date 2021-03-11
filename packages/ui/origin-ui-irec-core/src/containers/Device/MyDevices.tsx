import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserStatus } from '@energyweb/origin-backend-core';
import { getUserOffchain } from '@energyweb/origin-ui-core';
import { DeviceTable } from '../../components/devices/table';
import { getMyDevices, fetchMyDevices } from '../../features/devices';
import { getDeviceClient } from '../../features';

export function MyDevices() {
    const dispatch = useDispatch();

    const user = useSelector(getUserOffchain);
    const userIsActive = user?.status === UserStatus.Active;

    const myDevices = useSelector(getMyDevices);
    const iRecClient = useSelector(getDeviceClient)?.iRecClient;

    useEffect(() => {
        if (iRecClient && userIsActive) {
            dispatch(fetchMyDevices());
        }
    }, [iRecClient, user]);

    return (
        <DeviceTable
            devices={myDevices}
            owner={user?.id}
            showAddDeviceButton={true}
            actions={{
                requestCertificates: true
            }}
        />
    );
}
