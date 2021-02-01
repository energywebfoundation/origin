import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Role } from '@energyweb/origin-backend-core';
import { UserService } from '@energyweb/origin-backend';
import { ConnectionCreatedEvent } from '@energyweb/origin-organization-irec-api';
import { MailService } from '../../mail';

@EventsHandler(ConnectionCreatedEvent)
export class ConnectionCreatedHandler implements IEventHandler<ConnectionCreatedEvent> {
    private readonly logger = new Logger(ConnectionCreatedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService
    ) {}

    public async handle(event: ConnectionCreatedEvent): Promise<void> {
        const { organizationId, registration } = event;

        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: organizationId
            }
        });
        const emails = [registration.leadUserEmail] || organizationAdmins.map((a) => a.email);

        const result = await this.mailService.send({
            to: emails,
            subject: `IREC account connected`,
            html: `Your organization is now successfully connected to the I-REC Account.
                If you have not done so, please consider also connecting your blockchain account,
                in order to unlock all functionalities of the marketplace.`
        });

        if (result) {
            this.logger.log(`IREC Connected notification email sent to ${emails.join(', ')}.`);
        }
    }
}
