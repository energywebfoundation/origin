import { IssueStatus } from '@energyweb/issuer-irec-api-wrapper';
import { CertificationRequest } from '../certification-request.entity';

export class CertificationRequestStatusChangedEvent {
    constructor(
        public readonly certificationRequest: CertificationRequest,
        public readonly status: IssueStatus
    ) {}
}
