import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import {
    IrecCertificateService,
    CertificationRequestStatusChangedEvent
} from '@energyweb/issuer-irec-api';

@Injectable()
export class CheckIssueStateTask {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly irecIssueService: IrecCertificateService,
        private readonly eventBus: EventBus
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        if (!this.irecIssueService.isIrecIntegrationEnabled()) {
            return;
        }

        const devices = await this.irecIssueService.findAll();
        for (const device of devices) {
            const irecDevice = await this.irecIssueService.getDevice(device.ownerId, device.code);
            if (irecDevice.status !== device.status) {
                await this.irecIssueService.updateStatus(device.id, irecDevice.status);

                this.eventBus.publish(
                    new CertificationRequestStatusChangedEvent(device, irecDevice.status)
                );
            }
        }
    }
}
