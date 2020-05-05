import { CertificateClient, ICertificateClient } from './CertificateClient';
import { ConfigurationClient, IConfigurationClient } from './ConfigurationClient';
import { DeviceClient, IDeviceClient } from './DeviceClient';
import { FilesClient, IFilesClient } from './FilesClient';
import { IOrganizationClient, OrganizationClient } from './OrganizationClient';
import { IPreciseProofClient, PreciseProofClient } from './PreciseProofClient';
import { IRequestClient, RequestClient } from './RequestClient';
import { IUserClient, UserClient } from './UserClient';
import { IAdminClient, AdminClient } from './AdminClient';

export interface IOffChainDataSource {
    dataApiUrl: string;
    requestClient: IRequestClient;
    preciseProofClient: IPreciseProofClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    organizationClient: IOrganizationClient;
    filesClient: IFilesClient;
    certificateClient: ICertificateClient;
    adminClient: IAdminClient;
}

export class OffChainDataSource implements IOffChainDataSource {
    preciseProofClient: IPreciseProofClient;

    configurationClient: IConfigurationClient;

    userClient: IUserClient;

    deviceClient: IDeviceClient;

    organizationClient: IOrganizationClient;

    filesClient: IFilesClient;

    certificateClient: ICertificateClient;

    adminClient: IAdminClient;

    constructor(
        public readonly backendUrl: string,
        public readonly port: number = 80,
        public readonly requestClient: IRequestClient = new RequestClient()
    ) {
        this.preciseProofClient = new PreciseProofClient(this.requestClient);
        this.configurationClient = new ConfigurationClient(this.dataApiUrl, this.requestClient);
        this.userClient = new UserClient(this.dataApiUrl, this.requestClient);
        this.deviceClient = new DeviceClient(this.dataApiUrl, this.requestClient);
        this.organizationClient = new OrganizationClient(this.dataApiUrl, this.requestClient);
        this.filesClient = new FilesClient(this.dataApiUrl, this.requestClient);
        this.certificateClient = new CertificateClient(this.dataApiUrl, this.requestClient);
        this.adminClient = new AdminClient(this.dataApiUrl, this.requestClient);
    }

    get dataApiUrl() {
        return `${this.backendUrl}:${this.port}/api`;
    }
}
