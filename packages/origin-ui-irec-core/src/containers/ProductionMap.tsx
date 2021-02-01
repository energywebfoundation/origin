import React from 'react';
import { DeviceMap } from '../components/map';
import { useSelector } from 'react-redux';
import { getAllDevices } from '../features/devices';

export function ProductionMap() {
    const allDevices = useSelector(getAllDevices);

    return <DeviceMap devices={allDevices} height="700px" />;
}
