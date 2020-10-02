import { Role } from '@energyweb/origin-backend-core';
import { UserService } from '@energyweb/origin-backend';
import { RegistrationCreatedEvent } from '@energyweb/origin-organization-irec-api';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { MailService } from '../../mail';

@EventsHandler(RegistrationCreatedEvent)
export class RegistrationCreatedHandler implements IEventHandler<RegistrationCreatedEvent> {
    private readonly logger = new Logger(RegistrationCreatedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService
    ) {}

    public async handle(event: RegistrationCreatedEvent): Promise<void> {
        const { registration, userId } = event;

        const user = await this.userService.findById(userId);
        const admins = await this.userService.getAll({ where: { rights: Role.Admin } });
        const emails = admins.map((a) => a.email);

        let form = '';

        for (const [key, value] of Object.entries(registration)) {
            form += `${key}: ${value} </br>`;
        }

        const result = await this.mailService.send({
            to: emails,
            subject: `[Origin] I-REC registration request`,
            html: `"User ${user.email} from organization ${user.organization.name} [id=${user.organization.id}] has requested to be connected to the I-REC registry with the following data: </br>
            
            ${form}`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
