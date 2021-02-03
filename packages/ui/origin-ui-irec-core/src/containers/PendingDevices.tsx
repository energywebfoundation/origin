import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DeviceStatus, isRole, Role } from '@energyweb/origin-backend-core';
import { getUserOffchain } from '@energyweb/origin-ui-core';
import {
    getAllDevices,
    getMyDevices,
    fetchPublicDevices,
    fetchMyDevices
} from '../features/devices';
import { DeviceTable } from '../components/table';

export function PendingDevices() {
    const dispatch = useDispatch();
    const user = useSelector(getUserOffchain);
    const rightSelector = isRole(user, Role.Issuer) ? getAllDevices : getMyDevices;
    const devices = useSelector(rightSelector);

    useEffect(() => {
        const rightFetch = isRole(user, Role.Issuer) ? fetchPublicDevices : fetchMyDevices;
        dispatch(rightFetch());
    }, [user]);

    return (
        <DeviceTable
            devices={devices}
            includedStatuses={[DeviceStatus.Submitted]}
            actions={{
                approve: true
            }}
        />
    );
}
