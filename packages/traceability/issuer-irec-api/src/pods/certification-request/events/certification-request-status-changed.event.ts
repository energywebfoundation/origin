import { IssuanceStatus } from '@energyweb/issuer-irec-api-wrapper';
import { CertificationRequest } from '@energyweb/issuer-api';

export class CertificationRequestStatusChangedEvent {
    constructor(
        public readonly certificationRequest: CertificationRequest,
        public readonly status: IssuanceStatus
    ) {}
}
