import { IPreciseProofClient, PreciseProofClient } from "./PreciseProofClient";
import { IConfigurationClient, ConfigurationClient } from "./ConfigurationClient";
import { IUserClient, UserClient } from "./UserClient";
import { IDeviceClient, DeviceClient } from "./DeviceClient";
import { IRequestClient, RequestClient } from "./RequestClient";
import { IOrganizationClient, OrganizationClient } from "./OrganizationClient";
import { IDemandClient, DemandClient } from "./DemandClient";
import { IEventClient, EventClient } from "./EventClient";

export interface IOffChainDataSource {
    dataApiUrl: string;
    requestClient: IRequestClient;
    preciseProofClient: IPreciseProofClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    organizationClient: IOrganizationClient;
    demandClient: IDemandClient;
    eventClient: IEventClient;
}

export class OffChainDataSource implements IOffChainDataSource {

    preciseProofClient: IPreciseProofClient;
    configurationClient: IConfigurationClient;
    userClient: IUserClient;
    deviceClient: IDeviceClient;
    organizationClient: IOrganizationClient;
    demandClient: IDemandClient;
    eventClient: IEventClient;

    constructor(
        public readonly backendUrl: string,
        public readonly port: number = 80,
        public readonly requestClient: IRequestClient = new RequestClient()
    ) {
        const eventApi = `${this.backendUrl}:${port + 1}`;

        this.preciseProofClient = new PreciseProofClient(this.requestClient);
        this.configurationClient = new ConfigurationClient(this.dataApiUrl, this.requestClient);
        this.userClient = new UserClient(this.dataApiUrl, this.requestClient);
        this.deviceClient = new DeviceClient(this.dataApiUrl, this.requestClient);
        this.organizationClient = new OrganizationClient(this.dataApiUrl, this.requestClient);
        this.demandClient = new DemandClient(this.dataApiUrl, this.requestClient);

        this.eventClient = new EventClient(eventApi);
        this.eventClient.start();
    }

    get dataApiUrl() {
        return `${this.backendUrl}:${this.port}/api`;
    }
}