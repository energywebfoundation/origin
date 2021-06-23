import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '../device.service';
import { DeviceStatusChangedEvent } from '../events';

@Injectable()
export class CheckDeviceStateTask {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly deviceService: DeviceService,
        @Inject(IREC_SERVICE)
        private readonly irecService: IrecService,
        private readonly eventBus: EventBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (!this.irecService.isIrecIntegrationEnabled()) {
            return;
        }

        const devices = await this.deviceService.findAll();
        for (const device of devices) {
            const irecDevice = await this.irecService.getDevice(device.ownerId, device.code);
            if (irecDevice.status !== device.status) {
                await this.deviceService.updateStatus(device.id, irecDevice.status);

                this.eventBus.publish(new DeviceStatusChangedEvent(device, irecDevice.status));
            }
        }
    }
}
