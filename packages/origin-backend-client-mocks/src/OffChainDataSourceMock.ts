import {
    IOffChainDataSource,
    IPreciseProofClient,
    IConfigurationClient,
    IUserClient,
    IDeviceClient,
    IRequestClient,
    RequestClient,
    IOrganizationClient
} from "@energyweb/origin-backend-client";

import { PreciseProofClientMock } from "./PreciseProofClientMock";
import { ConfigurationClientMock } from "./ConfigurationClientMock";
import { UserClientMock } from "./UserClientMock";
import { DeviceClientMock } from "./DeviceClientMock";
import { OrganizationClientMock } from "./OrganizationClientMock";

export class OffChainDataSourceMock implements IOffChainDataSource {

    preciseProofClient: IPreciseProofClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    organizationClient: IOrganizationClient;

    constructor(
        public readonly baseUrl: string,
        public readonly requestClient: IRequestClient = new RequestClient()
    ) {
        this.preciseProofClient = new PreciseProofClientMock();
        this.configurationClient = new ConfigurationClientMock(this.baseUrl);
        this.userClient = new UserClientMock();
        this.deviceClient = new DeviceClientMock();
        this.organizationClient = new OrganizationClientMock();
    }
}