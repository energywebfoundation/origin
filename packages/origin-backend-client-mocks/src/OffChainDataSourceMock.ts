import {
    IOffChainDataSource,
    IConfigurationClient,
    IUserClient,
    IDeviceClient,
    IRequestClient,
    RequestClient,
    IOrganizationClient,
    IFilesClient,
    ICertificateClient,
    IAdminClient,
    ICertificationRequestClient
} from '@energyweb/origin-backend-client';

import { ConfigurationClientMock } from './ConfigurationClientMock';
import { UserClientMock } from './UserClientMock';
import { DeviceClientMock } from './DeviceClientMock';
import { OrganizationClientMock } from './OrganizationClientMock';
import { CertificateClientMock } from './CertificateClientMock';
import { CertificationRequestClientMock } from './CertificationRequestClientMock';

export class OffChainDataSourceMock implements IOffChainDataSource {
    dataApiUrl: string;

    configurationClient: IConfigurationClient = new ConfigurationClientMock();

    userClient: IUserClient = new UserClientMock();

    deviceClient: IDeviceClient = new DeviceClientMock();

    organizationClient: IOrganizationClient = new OrganizationClientMock();

    requestClient: IRequestClient = new RequestClient();

    filesClient: IFilesClient;

    certificateClient: ICertificateClient = new CertificateClientMock();

    certificationRequestClient: ICertificationRequestClient = new CertificationRequestClientMock();

    adminClient: IAdminClient;
}
