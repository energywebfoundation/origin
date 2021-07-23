interface GetCertificationRequestsParams {
    approved?: boolean;
    owner?: string;
    deviceIds?: string[];
}

export class GetAllCertificationRequestsQuery {
    constructor(public readonly query?: GetCertificationRequestsParams) {}
}
