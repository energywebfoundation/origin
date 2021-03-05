import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { getBackendClient } from '../../features/general';
import { fetchAllDevices, getAllDevices } from '../../features/devices';
import { TableFallback } from '../Table';
import { DeviceTable } from './Table/DeviceTable';

export function AllDevices() {
    const dispatch = useDispatch();
    const deviceClient = useSelector(getBackendClient)?.deviceClient;
    const allDevices = useSelector(getAllDevices);

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchAllDevices());
        }
    }, [deviceClient]);

    if (allDevices === null) {
        return <TableFallback />;
    }

    return (
        <DeviceTable
            devices={allDevices}
            hiddenColumns={['status']}
            includedStatuses={[DeviceStatus.Active]}
            actions={{}}
        />
    );
}
