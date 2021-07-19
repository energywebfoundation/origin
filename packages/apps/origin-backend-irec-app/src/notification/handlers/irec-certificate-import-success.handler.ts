import { IrecCertificateImportSuccessEvent } from '@energyweb/issuer-irec-api';
import { UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MailService } from '../../mail';

@EventsHandler(IrecCertificateImportSuccessEvent)
export class IrecCertificateImportSuccessHandler
    implements IEventHandler<IrecCertificateImportSuccessEvent>
{
    private readonly logger = new Logger(IrecCertificateImportSuccessEvent.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService
    ) {}

    public async handle({ user, assetId }: IrecCertificateImportSuccessEvent): Promise<void> {
        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: parseInt(user.ownerId, 10)
            }
        });
        const emails = organizationAdmins.map((a) => a.email);

        // todo: implement import and notification about it

        const result = await this.mailService.send({
            to: emails,
            subject: `IREC certificate import successful`,
            html: `IREC certificate import successful`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
