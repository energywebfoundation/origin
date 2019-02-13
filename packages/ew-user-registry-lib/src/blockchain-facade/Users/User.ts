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

export class User extends BlockchainDataModelEntity.Entity implements UserProperties {

    id: string;

    static async CREATE_USER(
        userProperties: UserProperties,
        userPropertiesOffChain: UserPropertiesOffChain,
        configuration: Configuration.Entity,
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

    configuration: Configuration.Entity;

    constructor(accountAddress: string, configuration: Configuration.Entity) {
        super(accountAddress, configuration);
    }

    getUrl(): string {
      return "http://localhost:3000/"
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
