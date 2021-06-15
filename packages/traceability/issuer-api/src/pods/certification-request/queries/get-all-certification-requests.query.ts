interface GetCertificationRequestsParams {
    approved?: boolean;
    owner?: string;
}

export class GetAllCertificationRequestsQuery {
    constructor(public readonly query?: GetCertificationRequestsParams) {}
}
