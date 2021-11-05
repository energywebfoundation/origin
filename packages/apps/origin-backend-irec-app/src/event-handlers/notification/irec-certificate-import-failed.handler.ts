import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { IrecCertificateImportFailedEvent } from '@energyweb/issuer-irec-api';
import { UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';

import { MailService } from '../../mail';

@EventsHandler(IrecCertificateImportFailedEvent)
export class IrecCertificateImportFailedHandler
    implements IEventHandler<IrecCertificateImportFailedEvent>
{
    private readonly logger = new Logger(IrecCertificateImportFailedHandler.name);

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService
    ) {}

    public async handle({ user, assetId }: IrecCertificateImportFailedEvent): Promise<void> {
        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: parseInt(user.ownerId, 10)
            }
        });
        const emails = organizationAdmins.map((a) => a.email);
        const result = await this.mailService.send({
            to: emails,
            subject: `IREC certificate import failed`,
            html: `IREC certificate import failed for asset ${assetId}`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
