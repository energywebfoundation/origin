import React from 'react';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { ProducingDeviceTable } from './ProducingDevice/ProducingDeviceTable';

export function AllDevices() {
    return (
        <ProducingDeviceTable
            hiddenColumns={['status']}
            includedStatuses={[DeviceStatus.Active]}
            actions={{}}
        />
    );
}
