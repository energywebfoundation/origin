import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
    DeviceService,
    DeviceStatusChangedEvent,
    IrecDeviceService
} from '@energyweb/origin-device-registry-irec-local-api';

@Injectable()
export class CheckDeviceStateTask {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly deviceService: DeviceService,
        private readonly irecDeviceService: IrecDeviceService,
        private readonly eventBus: EventBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (!this.irecDeviceService.isIrecIntegrationEnabled()) {
            return;
        }

        const devices = await this.deviceService.findAll();
        for (const device of devices) {
            const irecDevice = await this.irecDeviceService.getDevice(device.ownerId, device.code);
            if (irecDevice.status !== device.status) {
                await this.deviceService.updateStatus(device.id, irecDevice.status);

                this.eventBus.publish(new DeviceStatusChangedEvent(device, irecDevice.status));
            }
        }
    }
}
