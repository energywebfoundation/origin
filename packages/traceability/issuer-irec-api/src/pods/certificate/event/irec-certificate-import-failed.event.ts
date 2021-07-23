import { LoggedInUser } from '@energyweb/origin-backend-core';

export class IrecCertificateImportFailedEvent {
    constructor(public readonly user: LoggedInUser, public readonly assetId: string) {}
}
