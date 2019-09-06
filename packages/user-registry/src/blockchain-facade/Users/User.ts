// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector,
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it

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

    propertiesDocumentHash: string;

    url: string;

    id: string;

    organization: string;

    roles: number;

    active: boolean;

    configuration: Configuration.Entity;

    initialized: boolean;

    constructor(accountAddress: string, configuration: Configuration.Entity) {
        if (accountAddress) {
            accountAddress = accountAddress.toLowerCase();
        }

        super(accountAddress, configuration);

        this.initialized = false;
    }

    getUrl(): string {
        const userLogicInstanceAddress = this.configuration.blockchainProperties.userLogicInstance.web3Contract._address.toLowerCase();

        return `${this.configuration.offChainDataSource.baseUrl}/User/${userLogicInstanceAddress}`;
    }

    async sync(): Promise<Entity> {
        if (this.id !== null) {
            const userData = await this.configuration.blockchainProperties.userLogicInstance.getFullUser(
                this.id
            );

            this.propertiesDocumentHash = userData._propertiesDocumentHash;
            this.url = userData._documentDBURL;
            this.organization = userData._organization;
            this.roles = parseInt(userData._roles, 10);
            this.active = userData._active;

            this.offChainProperties = await this.getOffChainProperties(this.propertiesDocumentHash);

            this.initialized = true;

            if (this.configuration.logger) {
                this.configuration.logger.verbose(`User ${this.id} synced`);
            }
        }

        return this;
    }

    isRole(role: Role): boolean {
        if (!this.roles) {
            return false;
        }

        return Boolean(this.roles & Math.pow(2, role));
    }
}

export const createUser = async (
    userPropertiesOnChain: IUserOnChainProperties,
    userPropertiesOffChain: IUserOffChainProperties,
    configuration: Configuration.Entity
): Promise<Entity> => {
    const user = new Entity(null, configuration);

    const offChainStorageProperties = user.prepareEntityCreation(
        userPropertiesOnChain,
        userPropertiesOffChain,
        UserOffChainPropertiesSchema,
        user.getUrl()
    );

    if (configuration.offChainDataSource) {
        userPropertiesOnChain.url = user.getUrl();
        userPropertiesOnChain.propertiesDocumentHash = offChainStorageProperties.rootHash;
    }

    await configuration.blockchainProperties.userLogicInstance.createUser(
        userPropertiesOnChain.propertiesDocumentHash,
        userPropertiesOnChain.url,
        userPropertiesOnChain.id,
        userPropertiesOnChain.organization,
        {
            from: configuration.blockchainProperties.activeUser.address,
            privateKey: configuration.blockchainProperties.activeUser.privateKey
        }
    );

    await configuration.blockchainProperties.userLogicInstance.setRoles(
        userPropertiesOnChain.id,
        userPropertiesOnChain.roles
    );

    user.id = userPropertiesOnChain.id;

    await user.putToOffChainStorage(userPropertiesOffChain, offChainStorageProperties);

    if (configuration.logger) {
        configuration.logger.info(`User ${user.id} created`);
    }

    return user.sync();
};
