import {
    IOffChainDataSource,
    IPreciseProofClient,
    IConfigurationClient,
    IUserClient,
    IDeviceClient,
    IRequestClient,
    RequestClient,
    IOrganizationClient,
    IDemandClient,
    IEventClient
} from "@energyweb/origin-backend-client";

import { PreciseProofClientMock } from "./PreciseProofClientMock";
import { ConfigurationClientMock } from "./ConfigurationClientMock";
import { UserClientMock } from "./UserClientMock";
import { DeviceClientMock } from "./DeviceClientMock";
import { OrganizationClientMock } from "./OrganizationClientMock";
import { DemandClientMock } from "./DemandClientMock";
import { EventClientMock } from "./EventClientMock";

export class OffChainDataSourceMock implements IOffChainDataSource {
    dataApiUrl: string;

    preciseProofClient: IPreciseProofClient = new PreciseProofClientMock();
    configurationClient: IConfigurationClient = new ConfigurationClientMock();
    userClient: IUserClient = new UserClientMock();
    organizationClient: IOrganizationClient = new OrganizationClientMock();
    eventClient: IEventClient = new EventClientMock();

    demandClient: IDemandClient;
    deviceClient: IDeviceClient;

    requestClient: IRequestClient = new RequestClient();

    constructor() {
        this.deviceClient = new DeviceClientMock(this.eventClient);
        this.demandClient = new DemandClientMock(this.eventClient);
    }
}