import {
    ApproveCertificationRequestHandler,
    CertificateBoundToCertificationRequestCommand,
    RevokeCertificationRequestHandler,
    ValidateCertificationRequestHandler
} from '@energyweb/issuer-api';

import { CreateIrecCertificationRequestHandler } from './create-irec-certification-request.handler';
import { GetCertificationRequestHandler } from './get-certification-request.handler';
import { GetAllCertificationRequestsHandler } from './get-all-certification-requests.handler';
import { GetCertificationRequestByCertificateHandler } from './get-certification-request-by-certificate.handler';

export {
    ApproveCertificationRequestHandler,
    CertificateBoundToCertificationRequestCommand,
    CreateIrecCertificationRequestHandler,
    GetAllCertificationRequestsHandler,
    GetCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    RevokeCertificationRequestHandler,
    ValidateCertificationRequestHandler
};

export const Handlers = [
    ApproveCertificationRequestHandler,
    CertificateBoundToCertificationRequestCommand,
    CreateIrecCertificationRequestHandler,
    GetAllCertificationRequestsHandler,
    GetCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    RevokeCertificationRequestHandler,
    ValidateCertificationRequestHandler
];
