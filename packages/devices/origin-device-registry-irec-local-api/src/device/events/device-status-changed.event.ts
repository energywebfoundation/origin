import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';
import { Device } from '../device.entity';

export class DeviceStatusChangedEvent {
    constructor(public readonly device: Device, public readonly status: DeviceState) {}
}
