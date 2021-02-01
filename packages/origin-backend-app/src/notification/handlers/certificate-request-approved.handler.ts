import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DeviceService, UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import {
    CertificateRequestApprovedEvent,
    GetCertificationRequestQuery
} from '@energyweb/issuer-api';
import { RegistrationService } from '@energyweb/origin-organization-irec-api';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../mail';

@EventsHandler(CertificateRequestApprovedEvent)
export class CertificateRequestApprovedHandler
    implements IEventHandler<CertificateRequestApprovedEvent> {
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

        const device = await this.deviceService.findByExternalId({
            id: certificationRequest.deviceId,
            type: this.issuerTypeId
        });
        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organizationId: device.organizationId
            }
        });
        const registrations = await this.registrationService.find(String(device.organizationId));

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
                `from the device ${device.facilityName} and the time frame ` +
                `${from} to ${to} has been approved. Go to your certificate inbox to view all certificates.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
