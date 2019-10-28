import { User } from '@energyweb/user-registry';
import { Configuration, Currency } from '@energyweb/utils-general';
import MarketUserOffChainPropertiesSchema from '../../schemas/MarketUserOffChainProperties.schema.json';

export interface IAutoPublishConfig {
    enabled: boolean;
    currency: Currency;
    price: number;
}

export interface IMarketUserOffChainProperties extends User.IUserOffChainProperties {
    notifications?: boolean;
    autoPublish?: IAutoPublishConfig;
}

export class Entity extends User.Entity {
    offChainProperties: IMarketUserOffChainProperties;

    async update(offChainProperties: IMarketUserOffChainProperties) {
        const updatedOffChainStorageProperties = this.prepareEntityCreation(
            offChainProperties,
            MarketUserOffChainPropertiesSchema,
            this.getUrl()
        );

        await this.configuration.blockchainProperties.userLogicInstance.updateUser(
            this.id,
            updatedOffChainStorageProperties.rootHash,
            this.getUrl(),
            {
                from: this.configuration.blockchainProperties.activeUser.address,
                privateKey: this.configuration.blockchainProperties.activeUser.privateKey
            }
        );

        await this.syncOffChainStorage(offChainProperties, updatedOffChainStorageProperties);

        return new Entity(this.id, this.configuration).sync();
    }
}

export const createMarketUser = async (
    userPropertiesOnChain: User.IUserOnChainProperties,
    userPropertiesOffChain: IMarketUserOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const user = new Entity(null, configuration);

    const updatedUserPropertiesOnChain = userPropertiesOnChain;

    const offChainStorageProperties = user.prepareEntityCreation(
        userPropertiesOffChain,
        MarketUserOffChainPropertiesSchema,
        user.getUrl()
    );

    if (configuration.offChainDataSource) {
        updatedUserPropertiesOnChain.url = user.getUrl();
        updatedUserPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    const accountProperties = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    await configuration.blockchainProperties.userLogicInstance.createUser(
        updatedUserPropertiesOnChain.propertiesDocumentHash,
        updatedUserPropertiesOnChain.url,
        updatedUserPropertiesOnChain.id,
        updatedUserPropertiesOnChain.organization,
        accountProperties
    );

    await configuration.blockchainProperties.userLogicInstance.setRoles(
        updatedUserPropertiesOnChain.id,
        updatedUserPropertiesOnChain.roles,
        accountProperties
    );

    user.id = updatedUserPropertiesOnChain.id;

    await user.syncOffChainStorage(userPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`User ${user.id} created`);
    }

    return user.sync();
};
