import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceService, UserService } from '@energyweb/origin-backend';
import { Role } from '@energyweb/origin-backend-core';
import { CertificateCreatedEvent, CertificationRequest } from '@energyweb/issuer-api';
import { RegistrationService } from '@energyweb/origin-organization-irec-api';
import { MailService } from '../../mail';

@EventsHandler(CertificateCreatedEvent)
export class CertificateApprovedHandler implements IEventHandler<CertificateCreatedEvent> {
    private readonly logger = new Logger(CertificateApprovedHandler.name);

    constructor(
        @InjectRepository(CertificationRequest)
        private readonly repository: Repository<CertificationRequest>,
        private readonly mailService: MailService,
        private readonly userService: UserService,
        private readonly registrationService: RegistrationService,
        private readonly deviceService: DeviceService
    ) {}

    public async handle(event: CertificateCreatedEvent): Promise<void> {
        const { certificateId } = event;
        const certificationRequest = await this.repository.findOne(certificateId);

        if (!certificationRequest.approved) {
            return;
        }

        const device = await this.deviceService.findOne(certificationRequest.deviceId);
        const organization = await this.userService.findById(device.organization.id);
        const organizationAdmins = await this.userService.getAll({
            where: {
                rights: Role.OrganizationAdmin,
                organization: organization.id
            }
        });
        const registrations = await this.registrationService.find(String(organization.id));

        const emails = registrations.length
            ? registrations.map((r) => r.leadUserEmail)
            : organizationAdmins.map((a) => a.email);

        const from = new Date(certificationRequest.fromTime * 1000);
        const to = new Date(certificationRequest.toTime * 1000);
        const result = await this.mailService.send({
            to: emails,
            subject: `Certificate request approved`,
            html:
                `Your certificate with the volume of ${certificationRequest.energy} W ` +
                `from the device ${device.facilityName} and the time frame ` +
                `${from} to ${to} has been approved. Go to your certificate inbox to view all certificates.`
        });

        if (result) {
            this.logger.log(`Notification email sent to ${emails.join(', ')}.`);
        }
    }
}
