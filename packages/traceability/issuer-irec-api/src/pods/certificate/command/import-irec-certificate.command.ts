import { ILoggedInUser } from '@energyweb/origin-backend-core';
import { ImportIrecCertificateDTO } from '../dto';

export class ImportIrecCertificateCommand {
    constructor(
        public readonly user: ILoggedInUser,
        public readonly certificateToImport: ImportIrecCertificateDTO
    ) {}
}
