import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isRole, Role } from '@energyweb/origin-backend-core';
import { getUserOffchain } from '@energyweb/origin-ui-core';
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-client';
import {
    fetchMyDevices,
    fetchPublicDevices,
    getAllDevices,
    getMyDevices
} from '../../features/devices';
import { DeviceTable } from '../../components/devices/table';

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
            includedStatuses={[DeviceState.Draft, DeviceState.InProgress]}
            actions={{
                approve: true
            }}
        />
    );
}
