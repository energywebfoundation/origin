import { CreateCertificationRequestHandler } from './create-certification-request.handler';
import { GetAllCertificationRequestsHandler } from './get-all-certification-requests.handler';
import { ApproveCertificationRequestHandler } from './approve-certification-request.handler';
import { GetCertificationRequestHandler } from './get-certification-request.handler';
import { RevokeCertificationRequestHandler } from './revoke-certification-request.handler';
import { GetCertificationRequestByCertificateHandler } from './get-certification-request-by-certificate.handler';
import { ValidateCertificationRequestHandler } from './validate-certification-request.handler';

export const Handlers = [
    CreateCertificationRequestHandler,
    GetAllCertificationRequestsHandler,
    ApproveCertificationRequestHandler,
    GetCertificationRequestHandler,
    RevokeCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    ValidateCertificationRequestHandler
];
