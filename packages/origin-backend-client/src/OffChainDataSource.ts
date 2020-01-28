import { IPreciseProofClient, PreciseProofClient } from "./PreciseProofClient";
import { IConfigurationClient, ConfigurationClient } from "./ConfigurationClient";
import { IUserClient, UserClient } from "./UserClient";
import { IDeviceClient, DeviceClient } from "./DeviceClient";
import { IRequestClient, RequestClient } from "./RequestClient";
import { IOrganizationClient, OrganizationClient } from "./OrganizationClient";

export interface IOffChainDataSource {
    baseUrl: string;
    requestClient: IRequestClient;
    preciseProofClient: IPreciseProofClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    organizationClient: IOrganizationClient;
}

export class OffChainDataSource implements IOffChainDataSource {

    preciseProofClient: IPreciseProofClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    organizationClient: IOrganizationClient;

    constructor(
        public readonly baseUrl: string,
        public readonly requestClient: IRequestClient = new RequestClient()
    ) {
        this.preciseProofClient = new PreciseProofClient(this.requestClient);
        this.configurationClient = new ConfigurationClient(this.baseUrl, this.requestClient);
        this.userClient = new UserClient(this.baseUrl, this.requestClient);
        this.deviceClient = new DeviceClient(this.baseUrl, this.requestClient);
        this.organizationClient = new OrganizationClient(this.baseUrl, this.requestClient);
    }
}