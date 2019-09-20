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
// @authors: slock.it GmbH; Heiko Burkhardt, heiko.burkhardt@slock.it; Martin Kuechler, martin.kuchler@slock.it; Chirag Parmar, chirag.parmar@slock.it

import * as Asset from '@energyweb/asset-registry';
import * as GeneralLib from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const onboardDemo = async (
    actionString: string,
    conf: GeneralLib.Configuration.Entity,
    adminPrivateKey: string
) => {
    const action = JSON.parse(actionString);

    const adminPK = adminPrivateKey.startsWith('0x') ? adminPrivateKey : '0x' + adminPrivateKey;

    const adminAccount = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(adminPK);

    switch (action.type) {
        case 'CREATE_ACCOUNT':
            const userPropsOnChain: User.IUserOnChainProperties = {
                propertiesDocumentHash: null,
                url: null,
                id: action.data.address,
                active: true,
                roles: action.data.rights,
                organization: action.data.organization
            };

            const userPropsOffChain: User.IUserOffChainProperties = {
                firstName: action.data.firstName,
                surname: action.data.surname,
                email: action.data.email,
                street: action.data.street,
                number: action.data.number,
                zip: action.data.zip,
                city: action.data.city,
                country: action.data.country,
                state: action.data.state,
                notifications: true
            };

            await User.createUser(userPropsOnChain, userPropsOffChain, conf);

            conf.logger.info('Onboarded a new user: ' + action.data.address);
            conf.logger.verbose(
                'User Properties: ' + action.data.organization + ', ' + action.data.rights
            );

            break;

        case 'CREATE_PRODUCING_ASSET':
            console.log('-----------------------------------------------------------');

            const assetProducingProps: Asset.ProducingAsset.IOnChainProperties = {
                smartMeter: { address: action.data.smartMeter },
                owner: { address: action.data.owner },
                lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
                active: action.data.active,
                lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
                matcher: [{ address: action.data.matcher }],
                propertiesDocumentHash: null,
                url: null,
                maxOwnerChanges: action.data.maxOwnerChanges
            };

            const assetTypeConfig = action.data.assetType;
            const assetCompliance =
                GeneralLib.Compliance[action.data.complianceRegistry as keyof typeof GeneralLib.Compliance];

            const assetProducingPropsOffChain: Asset.ProducingAsset.IOffChainProperties = {
                operationalSince: action.data.operationalSince,
                capacityWh: action.data.capacityWh,
                country: action.data.country,
                address: action.data.address,
                gpsLatitude: action.data.gpsLatitude,
                gpsLongitude: action.data.gpsLongitude,
                assetType: assetTypeConfig,
                complianceRegistry: assetCompliance,
                otherGreenAttributes: action.data.otherGreenAttributes,
                typeOfPublicSupport: action.data.typeOfPublicSupport,
                facilityName: action.data.facilityName
            };

            try {
                await Asset.ProducingAsset.createAsset(
                    assetProducingProps,
                    assetProducingPropsOffChain,
                    conf
                );
            } catch (e) {
                conf.logger.error('ERROR: ' + e);
            }

            console.log('-----------------------------------------------------------\n');

            break;
        case 'CREATE_CONSUMING_ASSET':
            console.log('-----------------------------------------------------------');

            const assetConsumingProps: Asset.ConsumingAsset.IOnChainProperties = {
                certificatesUsedForWh: action.data.certificatesCreatedForWh,
                smartMeter: { address: action.data.smartMeter },
                owner: { address: action.data.owner },
                lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
                active: action.data.active,
                lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
                matcher: [{ address: action.data.matcher }],
                propertiesDocumentHash: null,
                url: null
            };

            const assetConsumingPropsOffChain: Asset.Asset.IOffChainProperties = {
                capacityWh: action.data.capacityWh,
                country: action.data.country,
                address: action.data.address,
                gpsLatitude: action.data.gpsLatitude,
                gpsLongitude: action.data.gpsLongitude,
                operationalSince: action.data.operationalSince,
                facilityName: action.data.facilityName
            };

            try {
                await Asset.ConsumingAsset.createAsset(
                    assetConsumingProps,
                    assetConsumingPropsOffChain,
                    conf
                );
            } catch (e) {
                conf.logger.error(e);
            }

            console.log('-----------------------------------------------------------\n');
            break;

        case 'SLEEP':
            console.log('sleep');
            await sleep(action.data);
            break;

        default:
            conf.logger.warn('Unidentified Command: ' + action.type);
    }
};
