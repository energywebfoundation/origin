import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Role } from '@energyweb/origin-backend-core';
import { OrganizationService, UserService } from '@energyweb/origin-backend';
import {
    ConnectionCreatedEvent,
    RegistrationService
} from '@energyweb/origin-organization-irec-api';
import { MailService } from '../../mail';

@EventsHandler(ConnectionCreatedEvent)
export class ConnectionCreatedHandler implements IEventHandler<ConnectionCreatedEvent> {
    private readonly logger = new Logger(ConnectionCreatedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly registrationService: RegistrationService,
        private readonly organizationService: OrganizationService
    ) {}

    public async handle(event: ConnectionCreatedEvent): Promise<void> {
        const { organizationId, registration } = event;

        const organization = await this.organizationService.findOne(organizationId);
        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: organizationId
            }
        });
        const emails = [registration.leadUserEmail] || organizationAdmins.map((a) => a.email);

        const result = await this.mailService.send({
            to: emails,
            subject: `IREC connection created`,
            html: `Created connection to IREC API for organization ${organization.name}.`
        });

        if (result) {
            this.logger.log(`IREC Connected notification email sent to ${emails.join(', ')}.`);
        }
    }
}
