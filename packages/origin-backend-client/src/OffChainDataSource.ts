import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';
import {
    IOffChainDataSource,
    ICertificationRequestClient,
    IAdminClient,
    ICertificateClient,
    IDeviceClient,
    IFilesClient,
    IOrganizationClient,
    IInvitationClient,
    IRequestClient,
    IUserClient,
    IConfigurationClient
} from '@energyweb/origin-backend-core';
import { CertificateClient } from './CertificateClient';
import { ConfigurationClient } from './ConfigurationClient';
import { DeviceClient } from './DeviceClient';
import { FilesClient } from './FilesClient';
import { OrganizationClient } from './OrganizationClient';
import { InvitationClient } from './InvitationClient';
import { RequestClient } from './RequestClient';
import { UserClient } from './UserClient';
import { AdminClient } from './AdminClient';
import { CertificationRequestClient } from './CertificationRequestClient';

export class OffChainDataSource implements IOffChainDataSource {
    configurationClient: IConfigurationClient;

    userClient: IUserClient;

    deviceClient: IDeviceClient;

    organizationClient: IOrganizationClient;

    invitationClient: IInvitationClient;

    filesClient: IFilesClient;

    certificateClient: ICertificateClient;

    certificationRequestClient: ICertificationRequestClient;

    adminClient: IAdminClient;

    constructor(
        public readonly backendUrl: string,
        public readonly port: number = 80,
        public readonly enabledFeatures: OriginFeature[] = allOriginFeatures,
        public readonly requestClient: IRequestClient = new RequestClient()
    ) {
        this.configurationClient = new ConfigurationClient(this.dataApiUrl, this.requestClient);
        this.userClient = new UserClient(this.dataApiUrl, this.requestClient);
        this.organizationClient = new OrganizationClient(this.dataApiUrl, this.requestClient);
        this.invitationClient = new InvitationClient(this.dataApiUrl, this.requestClient)
        this.filesClient = new FilesClient(this.dataApiUrl, this.requestClient);
        this.adminClient = new AdminClient(this.dataApiUrl, this.requestClient);

        if (enabledFeatures.includes(OriginFeature.Devices)) {
            this.deviceClient = new DeviceClient(this.dataApiUrl, this.requestClient);
        }

        if (enabledFeatures.includes(OriginFeature.Certificates)) {
            this.certificateClient = new CertificateClient(this.dataApiUrl, this.requestClient);
        }

        if (enabledFeatures.includes(OriginFeature.CertificationRequests)) {
            this.certificationRequestClient = new CertificationRequestClient(
                this.dataApiUrl,
                this.requestClient
            );
        }
    }

    get dataApiUrl(): string {
        return `${this.backendUrl}:${this.port}/api`;
    }
}
