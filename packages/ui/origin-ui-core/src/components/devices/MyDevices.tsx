import React from 'react';
import { ProducingDeviceTable } from './ProducingDevice/ProducingDeviceTable';

interface IProps {
    userId: number;
}

export function MyDevices({ userId }: IProps) {
    return (
        <ProducingDeviceTable
            owner={userId}
            showAddDeviceButton={true}
            actions={{
                requestCertificates: true
            }}
        />
    );
}
