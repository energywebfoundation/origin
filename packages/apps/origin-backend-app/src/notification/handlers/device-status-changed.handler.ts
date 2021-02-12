import { OrganizationService } from '@energyweb/origin-backend';
import { DeviceStatusChangedEvent } from '@energyweb/origin-device-registry-irec-form-api';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../mail';

@EventsHandler(DeviceStatusChangedEvent)
export class DeviceStatusChangedHandler implements IEventHandler<DeviceStatusChangedEvent> {
    private readonly logger = new Logger(DeviceStatusChangedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly organizationService: OrganizationService
    ) {}

    public async handle(event: DeviceStatusChangedEvent): Promise<void> {
        const { device, status } = event;

        const members = await this.organizationService.getDeviceManagers(device.organizationId);
        const emails = members.map((member) => member.email);

        const url = `${process.env.UI_BASE_URL}/devices/owned`;

        const result = await this.mailService.send({
            to: emails,
            subject: `[Origin] Device status has been updated`,
            html: `Your device with id: "${device.id}" has had its status changed to "${status}".<br /><br /><a href="${url}">${url}</a>`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
