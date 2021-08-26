import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { IREC_SERVICE, IrecService } from '@energyweb/origin-organization-irec-api';
import { DeviceService } from '../device.service';
import { DeviceStatusChangedEvent } from '../events';
import { DeviceState } from '@energyweb/issuer-irec-api-wrapper';

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
        const devices = await this.deviceService.findAll();
        for (const device of devices) {
            const irecDevice = await this.irecService.getDevice(device.ownerId, device.code);
            if (irecDevice && !this.areStatusesSame(irecDevice.status, device.status)) {
                await this.deviceService.updateStatus(device.id, irecDevice.status);

                this.eventBus.publish(new DeviceStatusChangedEvent(device, irecDevice.status));
            }
        }
    }

    areStatusesSame(status1?: string, status2?: string) {
        const inProgress: string[] = [DeviceState.InProgress, DeviceState.Submitted];
        return inProgress.includes(status1) && inProgress.includes(status2)
            ? true
            : status1 === status2;
    }
}
