import { IDevice, DeviceStatus } from '@energyweb/origin-backend-core';
import { BlockchainDataModelEntity, Configuration } from '@energyweb/utils-general';

export interface IOnChainProperties {
    smartMeter: Configuration.EthAccount;
    owner: Configuration.EthAccount;
}

export abstract class Entity extends BlockchainDataModelEntity.Entity
    implements IOnChainProperties {
    offChainProperties: IDevice;

    smartMeter: Configuration.EthAccount;

    owner: Configuration.EthAccount;

    initialized: boolean;

    constructor(id: string, configuration: Configuration.Entity) {
        super(id, configuration);

        this.initialized = false;
    }

    async createOffChainProperties(devicePropertiesOffChain: IDevice) {
        return this.configuration.offChainDataSource.deviceClient.add(
            Number(this.id),
            devicePropertiesOffChain
        );
    }

    async getOffChainProperties(): Promise<any> {
        return this.configuration.offChainDataSource.deviceClient.getById(Number(this.id));
    }

    async setStatus(status: DeviceStatus): Promise<IDevice> {
        return this.configuration.offChainDataSource.deviceClient.update(Number(this.id), {
            status
        });
    }
}
