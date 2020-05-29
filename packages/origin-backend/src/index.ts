import { Certificate } from './pods/certificate/certificate.entity';
import { CertificationRequest } from './pods/certificate/certification-request.entity';
import { OwnershipCommitment } from './pods/certificate/ownership-commitment.entity';
import { Configuration } from './pods/configuration/configuration.entity';
import { Device } from './pods/device/device.entity';
import { Organization } from './pods/organization/organization.entity';
import { OrganizationInvitation } from './pods/organization/organization-invitation.entity';
import { User } from './pods/user/user.entity';

export { AppModule } from './app.module';
export { ExtendedBaseEntity } from './pods/ExtendedBaseEntity';
export { ConfigurationService } from './pods/configuration/configuration.service';
export { DeviceService } from './pods/device/device.service';

export const entities = [
    Device,
    OwnershipCommitment,
    Configuration,
    Organization,
    User,
    OrganizationInvitation,
    CertificationRequest,
    Certificate
];
