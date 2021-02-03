import { OrganizationNameAlreadyTakenEvent, UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../mail';

@EventsHandler(OrganizationNameAlreadyTakenEvent)
export class OrganizationNameAlreadyTakenHandler
    implements IEventHandler<OrganizationNameAlreadyTakenEvent> {
    private readonly logger = new Logger(OrganizationNameAlreadyTakenHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService
    ) {}

    public async handle(event: OrganizationNameAlreadyTakenEvent): Promise<void> {
        const { name, member } = event;

        const admins = await this.userService.getAll({ where: { rights: Role.Admin } });
        const emails = admins.map((a) => a.email);

        const result = await this.mailService.send({
            to: emails,
            subject: `[Origin] New duplicated organization registration request`,
            html: `User ${member.email} tried to register new organization with name ${name} but it already exists. Please contact the user to resolve the problem.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
