import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrganizationRegisteredEvent, UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { RegistrationService } from '@energyweb/origin-organization-irec-api';

import { MailService } from '../../mail';

@EventsHandler(OrganizationRegisteredEvent)
export class OrganizationRegisteredHandler implements IEventHandler<OrganizationRegisteredEvent> {
    private readonly logger = new Logger(OrganizationRegisteredHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly registrationService: RegistrationService
    ) {}

    public async handle(event: OrganizationRegisteredEvent): Promise<void> {
        const { organization, member } = event;

        const admins = await this.userService.getAll({ where: { rights: Role.Admin } });
        const registrations = await this.registrationService.find(String(organization.id));
        const emails = [
            ...registrations.map((r) => r.leadUserEmail),
            ...admins.map((a) => a.email)
        ];

        const result = await this.mailService.send({
            to: emails,
            subject: `[Origin] New organization registered`,
            html: `User ${member.email} registered the organization ${organization.name} [id=${organization.id}] and is waiting for KYC approval.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(',')}.`);
        }
    }
}
