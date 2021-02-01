import { Device } from '../device.entity';

export class DeviceCreatedEvent {
    constructor(public readonly device: Device, public readonly userId: number) {}
}
