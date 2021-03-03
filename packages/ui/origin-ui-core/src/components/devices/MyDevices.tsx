import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBackendClient } from '../../features/general';
import { getMyDevices, fetchMyDevices } from '../../features/devices';
import { TableFallback } from '../Table';
import { DeviceTable } from './Table/DeviceTable';

export function MyDevices() {
    const dispatch = useDispatch();
    const myDevices = useSelector(getMyDevices);
    const deviceClient = useSelector(getBackendClient)?.deviceClient;

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchMyDevices());
        }
    }, [deviceClient]);

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
}
