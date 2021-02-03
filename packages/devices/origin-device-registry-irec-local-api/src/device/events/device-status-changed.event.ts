import { DeviceStatus } from '@energyweb/origin-backend-core';
import { Device } from '../device.entity';

export class DeviceStatusChangedEvent {
    constructor(public readonly device: Device, public readonly status: DeviceStatus) {}
}
