import {
    CertificateRequestApprovedEvent,
    GetCertificationRequestQuery
} from '@energyweb/issuer-irec-api';
import { UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { DeviceService } from '@energyweb/origin-device-registry-irec-local-api';
import { RegistrationService } from '@energyweb/origin-organization-irec-api';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';

import { MailService } from '../../mail';

@EventsHandler(CertificateRequestApprovedEvent)
export class CertificateRequestApprovedHandler
    implements IEventHandler<CertificateRequestApprovedEvent>
{
    private readonly logger = new Logger(CertificateRequestApprovedHandler.name);

    private readonly issuerTypeId: string;

    private _deviceService: DeviceService;

    constructor(
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly registrationService: RegistrationService,
        private readonly queryBus: QueryBus,
        private readonly moduleRef: ModuleRef,
        private readonly configService: ConfigService
    ) {
        this.issuerTypeId = this.configService.get<string>('ISSUER_ID');
    }

    private get deviceService() {
        if (this._deviceService) {
            return this._deviceService;
        }

        this._deviceService = this.moduleRef.get<DeviceService>(DeviceService, {
            strict: false
        });

        return this._deviceService;
    }

    public async handle(event: CertificateRequestApprovedEvent): Promise<void> {
        const { certificateRequestId } = event;

        const certificationRequest = await this.queryBus.execute(
            new GetCertificationRequestQuery(certificateRequestId)
        );

        const { ownerId, name } = await this.deviceService.findOne(certificationRequest.deviceId);

        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: parseInt(ownerId, 10)
            }
        });
        const registrations = await this.registrationService.find(ownerId);

        const emails = registrations.length
            ? registrations.map((r) => r.leadUserEmail)
            : organizationAdmins.map((a) => a.email);

        const from = new Date(certificationRequest.fromTime * 1000).toISOString();
        const to = new Date(certificationRequest.toTime * 1000).toISOString();
        const result = await this.mailService.send({
            to: emails,
            subject: `Certificate request approved`,
            html:
                `Your certificate with the volume of ${certificationRequest.energy} Watt ` +
                `from the device ${name} and the time frame ` +
                `${from} to ${to} has been approved. Go to your certificate inbox to view all certificates.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
