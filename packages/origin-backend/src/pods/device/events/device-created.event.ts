import { IDevice } from '@energyweb/origin-backend-core';

export class DeviceCreatedEvent {
    constructor(public readonly device: IDevice) {}
}
