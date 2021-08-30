import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DeviceTable } from '../../components/devices/table';
import { getMyDevices, fetchMyDevices } from '../../features/devices';
import { fromUsersSelectors } from '@energyweb/origin-ui-core';

export const MyDevices = () => {
    const dispatch = useDispatch();

    const user = useSelector(fromUsersSelectors.getUserOffchain);
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
};
