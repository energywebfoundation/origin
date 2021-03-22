import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-client';
import { fetchPublicDevices, getAllDevices } from '../../features/devices';
import { getDeviceClient } from '../../features/general';
import { DeviceTable } from '../../components/devices/table';

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
            includedStatuses={[DeviceState.Approved]}
            actions={{}}
        />
    );
}
