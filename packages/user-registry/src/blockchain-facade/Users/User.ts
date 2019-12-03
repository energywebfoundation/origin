import { Configuration, BlockchainDataModelEntity } from '@energyweb/utils-general';
import { Role } from '../../wrappedContracts/RoleManagement';
import UserOffChainPropertiesSchema from '../../../schemas/UserOffChainProperties.schema.json';

export interface IUserOffChainProperties {
    email: string;
    firstName?: string;
    surname?: string;
    street?: string;
    number?: string;
    zip?: string;
    city?: string;
    country?: string;
    state?: string;
}

export interface IUserOnChainProperties extends BlockchainDataModelEntity.IOnChainProperties {
    id: string;
    organization: string;
    roles: number;
    active?: boolean;
}

export class Entity extends BlockchainDataModelEntity.Entity implements IUserOnChainProperties {
    offChainProperties: IUserOffChainProperties;

    organization: string;

    roles: number;

    active: boolean;

    initialized: boolean;

    constructor(accountAddress: string, configuration: Configuration.Entity) {
        if (accountAddress) {
            accountAddress = accountAddress.toLowerCase();
        }

        super(accountAddress, configuration);

        this.initialized = false;
    }

    async sync(): Promise<Entity> {
        const { userLogicInstance } = this.configuration.blockchainProperties;

        if (
            this.id === null ||
            this.id === undefined ||
            this.id === '0x0000000000000000000000000000000000000000'
        ) {
            throw Error('Please provide an valid User ID.');
        }

        if (!(await userLogicInstance.doesUserExist(this.id))) {
            throw Error(`User doesn't exist.`);
        }

        const userData = await userLogicInstance.getFullUser(this.id);

        this.propertiesDocumentHash = userData._propertiesDocumentHash;
        this.url = userData._documentDBURL;
        this.organization = userData._organization;
        this.roles = parseInt(userData._roles, 10);
        this.active = userData._active;

        this.offChainProperties = await this.getOffChainProperties();

        this.initialized = true;

        if (this.configuration.logger) {
            this.configuration.logger.verbose(`User ${this.id} synced`);
        }

        return this;
    }

    isRole(role: Role): boolean {
        if (!this.roles) {
            return false;
        }

        return Boolean(this.roles & Math.pow(2, role));
    }

    async update(offChainProperties: IUserOffChainProperties) {
        const updatedOffChainStorageProperties = this.prepareEntityCreation(
            offChainProperties,
            UserOffChainPropertiesSchema
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
}

export const createUser = async (
    userPropertiesOnChain: IUserOnChainProperties,
    userPropertiesOffChain: IUserOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const user = new Entity(null, configuration);

    const offChainStorageProperties = user.prepareEntityCreation(
        userPropertiesOffChain,
        UserOffChainPropertiesSchema
    );

    user.id = userPropertiesOnChain.id;
    userPropertiesOnChain.url = `${user.baseUrl}/${offChainStorageProperties.rootHash}`;
    userPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;

    const accountProperties = {
        from: configuration.blockchainProperties.activeUser.address,
        privateKey: configuration.blockchainProperties.activeUser.privateKey
    };

    await user.syncOffChainStorage(userPropertiesOffChain, offChainStorageProperties);

    const {
        status: successCreateUser
    } = await configuration.blockchainProperties.userLogicInstance.createUser(
        userPropertiesOnChain.propertiesDocumentHash,
        userPropertiesOnChain.url,
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
        throw new Error('createUser: Saving on-chain data failed. Reverting...');
    }

    if (configuration.logger) {
        configuration.logger.info(`User ${user.id} created`);
    }

    return user.sync();
};
