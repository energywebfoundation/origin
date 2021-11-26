import { ILoggedInUser } from '@energyweb/origin-backend-core';

export class GetIrecCertificatesToImportCommand {
    constructor(public readonly user: ILoggedInUser) {}
}
