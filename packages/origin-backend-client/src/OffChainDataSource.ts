import { OriginFeature, allOriginFeatures } from '@energyweb/utils-general';
import { CertificateClient, ICertificateClient } from './CertificateClient';
import { ConfigurationClient, IConfigurationClient } from './ConfigurationClient';
import { DeviceClient, IDeviceClient } from './DeviceClient';
import { FilesClient, IFilesClient } from './FilesClient';
import { IOrganizationClient, OrganizationClient } from './OrganizationClient';
import { IRequestClient, RequestClient } from './RequestClient';
import { IUserClient, UserClient } from './UserClient';
import { IAdminClient, AdminClient } from './AdminClient';
import {
    CertificationRequestClient,
    ICertificationRequestClient
} from './CertificationRequestClient';

export interface IOffChainDataSource {
    dataApiUrl: string;
    requestClient: IRequestClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    organizationClient: IOrganizationClient;
    filesClient: IFilesClient;
    adminClient: IAdminClient;

    certificateClient?: ICertificateClient;
    certificationRequestClient?: ICertificationRequestClient;
    deviceClient?: IDeviceClient;
}

export class OffChainDataSource implements IOffChainDataSource {
    configurationClient: IConfigurationClient;

    userClient: IUserClient;

    deviceClient: IDeviceClient;

    organizationClient: IOrganizationClient;

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
