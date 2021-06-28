import {
    ApproveCertificationRequestHandler,
    CertificateBoundToCertificationRequestCommand,
    CreateCertificationRequestHandler,
    RevokeCertificationRequestHandler,
    ValidateCertificationRequestHandler
} from '@energyweb/issuer-api';

import { CreateIrecCertificationRequestHandler } from './create-irec-certification-request.handler';
import { GetCertificationRequestHandler } from './get-certification-request.handler';
import { GetAllCertificationRequestsHandler } from './get-all-certification-requests.handler';
import { GetCertificationRequestByCertificateHandler } from './get-certification-request-by-certificate.handler';
import { ApproveIrecCertificationRequestHandler } from './approve-irec-certification-request.handler';

export {
    ApproveCertificationRequestHandler,
    ApproveIrecCertificationRequestHandler,
    CertificateBoundToCertificationRequestCommand,
    CreateCertificationRequestHandler,
    CreateIrecCertificationRequestHandler,
    GetAllCertificationRequestsHandler,
    GetCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    RevokeCertificationRequestHandler,
    ValidateCertificationRequestHandler
};

export const Handlers = [
    ApproveCertificationRequestHandler,
    ApproveIrecCertificationRequestHandler,
    CertificateBoundToCertificationRequestCommand,
    CreateCertificationRequestHandler,
    CreateIrecCertificationRequestHandler,
    GetAllCertificationRequestsHandler,
    GetCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    RevokeCertificationRequestHandler,
    ValidateCertificationRequestHandler
];
