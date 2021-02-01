import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { getAllDevices, fetchPublicDevices } from '../features/devices';
import { getDeviceClient } from '../features/general';
import { DeviceTable } from '../components/table';

export function AllDevices() {
    const dispatch = useDispatch();
    const allDevices = useSelector(getAllDevices);
    const deviceClient = useSelector(getDeviceClient);

    useEffect(() => {
        if (deviceClient) {
            dispatch(fetchPublicDevices());
        }
    }, [deviceClient]);

    return (
        <DeviceTable
            devices={allDevices}
            hiddenColumns={['status']}
            includedStatuses={[DeviceStatus.Active]}
            actions={{}}
        />
    );
}
