interface GetCertificationRequestsParams {
    approved?: boolean;
}

export class GetAllCertificationRequestsQuery {
    constructor(public readonly query?: GetCertificationRequestsParams) {}
}
