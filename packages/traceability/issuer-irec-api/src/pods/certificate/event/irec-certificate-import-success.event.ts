import { LoggedInUser } from '@energyweb/origin-backend-core';

export class IrecCertificateImportSuccessEvent {
    constructor(public readonly user: LoggedInUser, public readonly assetId: string) {}
}
