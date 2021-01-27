import { GetAllCertificationRequestsQuery } from './get-all-certification-requests.query';
import { GetCertificationRequestQuery } from './get-certification-request.query';
import { GetCertificationRequestByCertificateQuery } from './get-certification-request-by-certificate.query';

export { GetAllCertificationRequestsQuery } from './get-all-certification-requests.query';
export { GetCertificationRequestQuery } from './get-certification-request.query';
export { GetCertificationRequestByCertificateQuery } from './get-certification-request-by-certificate.query';

export const Events = [
    GetAllCertificationRequestsQuery,
    GetCertificationRequestQuery,
    GetCertificationRequestByCertificateQuery
];
