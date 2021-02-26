import React from 'react';
import { DeviceStatus } from '@energyweb/origin-backend-core';
import { ProducingDeviceTable } from './ProducingDevice/ProducingDeviceTable';

export function PendingDevices() {
    return (
        <ProducingDeviceTable
            includedStatuses={[DeviceStatus.Submitted]}
            actions={{
                approve: true
            }}
        />
    );
}
