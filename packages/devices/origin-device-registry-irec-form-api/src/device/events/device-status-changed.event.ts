import { DeviceStatus, IDevice } from '@energyweb/origin-backend-core';

export class DeviceStatusChangedEvent {
    constructor(public readonly device: IDevice, public readonly status: DeviceStatus) {}
}
