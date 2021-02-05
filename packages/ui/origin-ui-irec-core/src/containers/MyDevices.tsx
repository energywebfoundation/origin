import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserOffchain } from '@energyweb/origin-ui-core';
import { DeviceTable } from '../components/table';
import { getMyDevices, fetchMyDevices } from '../features/devices';

export function MyDevices() {
    const dispatch = useDispatch();
    const user = useSelector(getUserOffchain);
    const myDevices = useSelector(getMyDevices);

    useEffect(() => {
        dispatch(fetchMyDevices());
    }, []);

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
