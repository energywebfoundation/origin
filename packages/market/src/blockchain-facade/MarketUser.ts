import { User } from '@energyweb/user-registry';
import { Configuration, signTypedMessage } from '@energyweb/utils-general';
import { UserRegisterData } from '@energyweb/origin-backend-core';

import { Currency } from '../types';
import MarketUserOffChainPropertiesSchema from '../../schemas/MarketUserOffChainProperties.schema.json';

export interface IAutoPublishConfig {
    enabled: boolean;
    currency: Currency;
    priceInCents: number;
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

        await this.syncOffChainStorage(offChainProperties, updatedOffChainStorageProperties);

        await this.configuration.blockchainProperties.userLogicInstance.updateUser(
            this.id,
            updatedOffChainStorageProperties.rootHash,
            this.fullUrl,
            {
                from: this.configuration.blockchainProperties.activeUser.address,
                privateKey: this.configuration.blockchainProperties.activeUser.privateKey
            }
        );

        return new Entity(this.id, this.configuration).sync();
    }

    async sync(): Promise<Entity> {
        return super.sync();
    }
}

interface IAccountProperties {
    address: string;
    privateKey?: string;
}

export const createMarketUser = async (
    userPropertiesOnChain: User.IUserOnChainProperties,
    userPropertiesOffChain: IMarketUserOffChainProperties,
    configuration: Configuration.Entity,
    registerData?: Partial<UserRegisterData>,
    createdUserPrivateKey?: string,
    adminProperties?: IAccountProperties
): Promise<Entity> => {
    const user = new Entity(null, configuration);

    const offChainStorageProperties = user.prepareEntityCreation(
        userPropertiesOffChain,
        MarketUserOffChainPropertiesSchema
    );

    user.id = userPropertiesOnChain.id;

    let { url, propertiesDocumentHash } = userPropertiesOnChain;

    propertiesDocumentHash = offChainStorageProperties.rootHash;
    url = `${user.baseUrl}/${propertiesDocumentHash}`;

    await user.syncOffChainStorage(userPropertiesOffChain, offChainStorageProperties);

    const adminAccountProperties = {
        from: adminProperties?.address ?? configuration.blockchainProperties.activeUser.address,
        privateKey:
            adminProperties?.privateKey ?? configuration.blockchainProperties.activeUser.privateKey
    };

    const {
        status: successCreateUser
    } = await configuration.blockchainProperties.userLogicInstance.createUser(
        propertiesDocumentHash,
        url,
        userPropertiesOnChain.id,
        adminAccountProperties
    );

    const {
        status: successSetRoles
    } = await configuration.blockchainProperties.userLogicInstance.setRoles(
        userPropertiesOnChain.id,
        userPropertiesOnChain.roles,
        adminAccountProperties
    );

    if (!successCreateUser || !successSetRoles) {
        await user.deleteFromOffChainStorage();
        throw new Error('createMarketUser: Saving on-chain data failed. Reverting...');
    }

    if (registerData) {
        const userClient = configuration?.offChainDataSource?.userClient;

        const userOffchain = await userClient.register({
            email: registerData.email ?? 'test@mailinator.com',
            firstName: registerData.firstName ?? 'John',
            lastName: registerData.lastName ?? 'Doe',
            password: registerData.password ?? 'test',
            telephone: registerData.telephone ?? '111-111-111',
            title: registerData.title ?? 'Mr',
            blockchainAccountAddress: '',
            blockchainAccountSignedMessage: ''
        });

        const REGISTRATION_MESSAGE_TO_SIGN =
            process.env.REGISTRATION_MESSAGE_TO_SIGN ?? 'I register as Origin user';

        const signedMessage = await signTypedMessage(
            userPropertiesOnChain.id,
            REGISTRATION_MESSAGE_TO_SIGN,
            configuration.blockchainProperties.web3,
            createdUserPrivateKey
        );

        await userClient.attachSignedMessage(userOffchain.id, signedMessage);
    }

    if (configuration.logger) {
        configuration.logger.info(`User ${user.id} created`);
    }

    return user.sync();
};
