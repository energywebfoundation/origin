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
            MarketUserOffChainPropertiesSchema
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

    const offChainStorageProperties = user.prepareEntityCreation(
        userPropertiesOffChain,
        MarketUserOffChainPropertiesSchema
    );

    user.id = userPropertiesOnChain.id;

    let { url, propertiesDocumentHash } = userPropertiesOnChain;

    url = user.getUrl();
    propertiesDocumentHash = offChainStorageProperties.rootHash;

    const accountProperties = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    await user.syncOffChainStorage(userPropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateUser
    } = await configuration.blockchainProperties.userLogicInstance.createUser(
        propertiesDocumentHash,
        url,
        userPropertiesOnChain.id,
        userPropertiesOnChain.organization,
        accountProperties
    );

    const {
        status: successSetRoles
    } = await configuration.blockchainProperties.userLogicInstance.setRoles(
        userPropertiesOnChain.id,
        userPropertiesOnChain.roles,
        accountProperties
    );

    if (!successCreateUser || !successSetRoles) {
        await user.deleteFromOffChainStorage();
        throw new Error('createMarketUser: Saving on-chain data failed. Reverting...');
    }

    if (configuration.logger) {
        configuration.logger.info(`User ${user.id} created`);
    }

    return user.sync();
};
