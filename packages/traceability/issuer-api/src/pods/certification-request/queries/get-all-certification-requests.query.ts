import { CertificationRequestStatus } from '../certification-request-status.enum';

interface GetCertificationRequestsParams {
    approved?: boolean;
    status?: CertificationRequestStatus;
}

export class GetAllCertificationRequestsQuery {
    constructor(public readonly query?: GetCertificationRequestsParams) {}
}
