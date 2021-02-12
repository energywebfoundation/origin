import { UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { DeviceCreatedEvent } from '@energyweb/origin-device-registry-irec-form-api';
import { RegistrationService } from '@energyweb/origin-organization-irec-api';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../mail';

@EventsHandler(DeviceCreatedEvent)
export class DeviceCreatedHandler implements IEventHandler<DeviceCreatedEvent> {
    private readonly logger = new Logger(DeviceCreatedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly registrationService: RegistrationService
    ) {}

    public async handle(event: DeviceCreatedEvent): Promise<void> {
        const { device, userId } = event;
        const user = await this.userService.findById(userId);
        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: user.organization.id
            }
        });
        const registrations = await this.registrationService.find(String(user.organization.id));
        const emails = registrations.length
            ? registrations.map((r) => r.leadUserEmail)
            : organizationAdmins.map((a) => a.email);
        let form = '';

        for (const [key, value] of Object.entries(device)) {
            form += `${key}: ${value} <br />`;
        }

        const result = await this.mailService.send({
            to: emails,
            subject: `New device/device group created`,
            html: `Created new device/device group for organization ${user.organization.name}.
                <br />Device details:<br />${form}`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
