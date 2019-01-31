import { Configuration, BlockchainDataModelEntity } from 'ew-utils-general-lib';

export interface UserProperties {
    id: string;
    organization: string;
    roles: number;
    active?: boolean;
}

export interface UserPropertiesOffChain {

    firstName: string;
    surname: string;
    street: string;
    number: string;
    zip: string;
    city: string;
    country: string;
    state: string;

}

export class User extends BlockchainDataModelEntity implements UserProperties {

    static async CREATE_USER(
        userProperties: UserProperties,
        userPropertiesOffChain: UserPropertiesOffChain,
        configuration: Configuration,
    ): Promise<User> {

        await configuration.blockchainProperties.userLogicInstance.setUser(
            userProperties.id,
            userProperties.organization,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey,
            });
        await configuration.blockchainProperties.userLogicInstance.setRoles(
            userProperties.id,
            userProperties.roles,
            {
                from: configuration.blockchainProperties.activeUser.address,
                privateKey: configuration.blockchainProperties.activeUser.privateKey,
            });
        if (configuration.logger) {
            configuration.logger.info(`User ${userProperties.id} synced`);
        }
        
        return (new User(userProperties.id, configuration)).sync();
    }

    organization: string;
    roles: number;
    active: boolean;

    configuration: Configuration;

    constructor(accountAddress: string, configuration: Configuration) {
        super(accountAddress, configuration);
    }

    async sync(): Promise<User> {
        if (this.id) {

            const userData = await this.configuration.blockchainProperties.userLogicInstance.getFullUser(this.id);

            this.organization = userData._organization;
            this.roles = parseInt(userData._roles, 10);
            this.active = userData._active;
            if (this.configuration.logger) {
                this.configuration.logger.verbose(`User ${this.id} synced`);
            }
            

        }
        return this;
    }

} 