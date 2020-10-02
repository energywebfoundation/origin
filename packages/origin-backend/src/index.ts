import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './pods/admin/admin.module';
import { Certificate } from './pods/certificate/certificate.entity';
import { CertificateModule } from './pods/certificate/certificate.module';
import { OwnershipCommitment } from './pods/certificate/ownership-commitment.entity';
import { CertificationRequestQueueItem } from './pods/certification-request/certification-request-queue-item.entity';
import { CertificationRequest } from './pods/certification-request/certification-request.entity';
import { CertificationRequestModule } from './pods/certification-request/certification-request.module';
import { Configuration } from './pods/configuration/configuration.entity';
import { ConfigurationModule } from './pods/configuration/configuration.module';
import { Device } from './pods/device/device.entity';
import { DeviceModule } from './pods/device/device.module';
import { EmailConfirmation } from './pods/email-confirmation/email-confirmation.entity';
import { EmailConfirmationModule } from './pods/email-confirmation/email-confirmation.module';
import { File } from './pods/file/file.entity';
import { FileModule } from './pods/file/file.module';
import { Invitation } from './pods/invitation/invitation.entity';
import { InvitationModule } from './pods/invitation/invitation.module';
import { Organization } from './pods/organization/organization.entity';
import { OrganizationModule } from './pods/organization/organization.module';
import { User } from './pods/user/user.entity';
import { UserModule } from './pods/user/user.module';

export { OrganizationModule, OrganizationService } from './pods/organization';

export { AppModule } from './app.module';
export { ConfigurationService } from './pods/configuration/configuration.service';
export { DeviceService } from './pods/device/device.service';

export * from './pods/organization/events';
export * from './pods/email-confirmation/events';
export * from './pods/invitation/events';
export * from './pods/device/events';
export * from './pods/user';

export {
    CertificationRequestApprovedEvent,
    CertificationRequestRevokedEvent
} from './pods/certification-request';

export const entities = [
    Device,
    OwnershipCommitment,
    Configuration,
    Organization,
    User,
    Invitation,
    CertificationRequest,
    CertificationRequestQueueItem,
    Certificate,
    EmailConfirmation,
    File
];

export const modules = [
    AuthModule,
    AdminModule,
    CertificateModule,
    ConfigurationModule,
    DeviceModule,
    FileModule,
    OrganizationModule,
    UserModule,
    EmailConfirmationModule,
    CertificationRequestModule,
    InvitationModule
];

export const providers = [{ provide: APP_PIPE, useClass: ValidationPipe }];
