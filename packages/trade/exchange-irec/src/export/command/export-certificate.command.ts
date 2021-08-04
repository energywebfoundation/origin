import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class ExportCertificateCommand {
    constructor(
        public user: ILoggedInUser,
        public certificateId: string,
        public recipientTradeAccount: string
    ) {}
}
