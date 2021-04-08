import {
    GetAllCertificationRequestsHandler,
    ApproveCertificationRequestHandler,
    GetCertificationRequestHandler,
    RevokeCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    ValidateCertificationRequestHandler
} from '@energyweb/issuer-api';
import { CreateCertificationRequestHandler } from './create-certification-request.handler';

export {
    GetAllCertificationRequestsHandler,
    ApproveCertificationRequestHandler,
    GetCertificationRequestHandler,
    RevokeCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    ValidateCertificationRequestHandler
};

export const Handlers = [
    CreateCertificationRequestHandler,
    GetAllCertificationRequestsHandler,
    ApproveCertificationRequestHandler,
    GetCertificationRequestHandler,
    RevokeCertificationRequestHandler,
    GetCertificationRequestByCertificateHandler,
    ValidateCertificationRequestHandler
];
