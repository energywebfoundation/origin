import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Certificate } from './pods/certificate/certificate.entity';
import { CertificationRequest } from './pods/certificate/certification-request.entity';
import { OwnershipCommitment } from './pods/certificate/ownership-commitment.entity';
import { Configuration } from './pods/configuration/configuration.entity';
import { Device } from './pods/device/device.entity';
import { Organization } from './pods/organization/organization.entity';
import { OrganizationInvitation } from './pods/organization/organization-invitation.entity';
import { User } from './pods/user/user.entity';
import { CertificationRequestQueueItem } from './pods/certificate/certification-request-queue-item.entity';
import { EmailConfirmation } from './pods/email-confirmation/email-confirmation.entity';

import { AuthModule } from './auth/auth.module';
import { AdminModule } from './pods/admin/admin.module';
import { CertificateModule } from './pods/certificate/certificate.module';
import { ConfigurationModule } from './pods/configuration/configuration.module';
import { DeviceModule } from './pods/device/device.module';
import { FileModule } from './pods/file/file.module';
import { OrganizationModule } from './pods/organization/organization.module';
import { UserModule } from './pods/user/user.module';
import { EmailConfirmationModule } from './pods/email-confirmation/email-confirmation.module';

export { AppModule } from './app.module';
export { ExtendedBaseEntity } from './pods/ExtendedBaseEntity';
export { ConfigurationService } from './pods/configuration/configuration.service';
export { DeviceService } from './pods/device/device.service';

export {
    CertificationRequestApprovedEvent,
    CertificationRequestRevokedEvent
} from './pods/certificate';

export const entities = [
    Device,
    OwnershipCommitment,
    Configuration,
    Organization,
    User,
    OrganizationInvitation,
    CertificationRequest,
    CertificationRequestQueueItem,
    Certificate,
    EmailConfirmation
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
    EmailConfirmationModule
];

export const providers = [{ provide: APP_PIPE, useClass: ValidationPipe }];
