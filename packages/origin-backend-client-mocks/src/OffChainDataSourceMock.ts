import {
    IOffChainDataSource,
    IPreciseProofClient,
    IConfigurationClient,
    IUserClient,
    IDeviceClient,
    IRequestClient,
    RequestClient,
    IOrganizationClient,
    IFilesClient,
    ICertificateClient
} from '@energyweb/origin-backend-client';

import { PreciseProofClientMock } from './PreciseProofClientMock';
import { ConfigurationClientMock } from './ConfigurationClientMock';
import { UserClientMock } from './UserClientMock';
import { DeviceClientMock } from './DeviceClientMock';
import { OrganizationClientMock } from './OrganizationClientMock';
import { CertificateClientMock } from './CertificateClientMock';

export class OffChainDataSourceMock implements IOffChainDataSource {
    dataApiUrl: string;

    preciseProofClient: IPreciseProofClient = new PreciseProofClientMock();

    configurationClient: IConfigurationClient = new ConfigurationClientMock();

    userClient: IUserClient = new UserClientMock();

    deviceClient: IDeviceClient;

    organizationClient: IOrganizationClient;

    requestClient: IRequestClient = new RequestClient();

    filesClient: IFilesClient;

    certificateClient: ICertificateClient = new CertificateClientMock();

    constructor() {
        this.deviceClient = new DeviceClientMock();
        this.organizationClient = new OrganizationClientMock();
    }
}
