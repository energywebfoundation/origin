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

import * as fs from 'fs';
import { onboardDemo } from './onboarding';

import * as Certificate from 'ew-origin-lib';
import * as User from 'ew-user-registry-lib';
import * as Asset from 'ew-asset-registry-lib';
import * as GeneralLib from 'ew-utils-general-lib';

import {
    deployERC20TestToken,
    Erc20TestToken,
    TestReceiver,
    deployERC721TestReceiver
} from 'ew-erc-test-contracts';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const certificateDemo = async (
    actionString: string,
    conf: GeneralLib.Configuration.Entity,
    adminPrivateKey: string
) => {
    const action = JSON.parse(actionString);

    const adminPK = adminPrivateKey.startsWith('0x') ? adminPrivateKey : '0x' + adminPrivateKey;

    const adminAccount = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(adminPK);

    switch (action.type) {
        case 'SAVE_SMARTMETER_READ_PRODUCING':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.smartMeter,
                privateKey: action.data.smartMeterPK
            };

            try {
                let asset = await new Asset.ProducingAsset.Entity(action.data.assetId, conf).sync();
                await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash);
                asset = await asset.sync();
                conf.logger.verbose('Producing smart meter reading saved');
            } catch (e) {
                conf.logger.error('Could not save smart meter reading for producing asset\n' + e);
            }

            console.log('-----------------------------------------------------------\n');

            break;
        case 'SAVE_SMARTMETER_READ_CONSUMING':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.smartMeter,
                privateKey: action.data.smartMeterPK
            };

            try {
                let asset = await new Asset.ConsumingAsset.Entity(action.data.assetId, conf).sync();
                await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash);
                asset = await asset.sync();
                conf.logger.verbose('Consuming meter reading saved');
            } catch (e) {
                conf.logger.error('Could not save smart meter reading for consuming asset\n' + e);
            }

            console.log('-----------------------------------------------------------\n');

            break;

        case 'SET_MARKET_CONTRACT':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: adminAccount.address,
                privateKey: adminPK
            };

            const contractConfig = JSON.parse(
                fs.readFileSync('./config/contractConfig.json', 'utf8').toString()
            );

            try {
                await conf.blockchainProperties.producingAssetLogicInstance.setMarketLookupContract(
                    action.data.assetId,
                    contractConfig.originContractLookup,
                    { privateKey: action.data.assetOwnerPK }
                );
                conf.logger.info('Certificates for Asset #' + action.data.assetId + ' initialized');
            } catch (e) {
                conf.logger.error('Could not intialize certificates\n' + e);
            }
            console.log('-----------------------------------------------------------');
            break;

        case 'TRANSFER_CERTIFICATE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.assetOwner,
                privateKey: action.data.assetOwnerPK
            };

            try {
                conf.logger.verbose(
                    'Asset Owner Balance(BEFORE): ' +
                        (await Certificate.TradableEntity.getBalance(action.data.assetOwner, conf))
                );
                conf.logger.verbose(
                    'Asset Owner Balance(BEFORE): ' +
                        (await Certificate.TradableEntity.getBalance(action.data.addressTo, conf))
                );
                const certificate = await new Certificate.Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();
                await certificate.transferFrom(action.data.addressTo);
                conf.logger.info('Certificate Transferred');
                conf.logger.verbose(
                    'Asset Owner Balance(AFTER): ' +
                        (await Certificate.TradableEntity.getBalance(action.data.assetOwner, conf))
                );
                conf.logger.verbose(
                    'Asset Owner Balance(AFTER): ' +
                        (await Certificate.TradableEntity.getBalance(action.data.addressTo, conf))
                );
            } catch (e) {
                conf.logger.error('Could not transfer certificates\n' + e);
            }

            console.log('-----------------------------------------------------------\n');
            break;

        case 'SPLIT_CERTIFICATE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.assetOwner,
                privateKey: action.data.assetOwnerPK
            };

            try {
                let certificate = await new Certificate.Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();
                await certificate.splitCertificate(action.data.splitValue);
                certificate = await certificate.sync();

                conf.logger.info('Certificate Split into:', certificate.children);

                for (const cId of certificate.children) {
                    const c = await new Certificate.Certificate.Entity(cId.toString(), conf).sync();
                    conf.logger.info('Child Certificate #' + cId + ' - PowerInW: ' + c.powerInW);
                }
            } catch (e) {
                conf.logger.error('Could not split certificates\n' + e);
            }

            console.log('-----------------------------------------------------------\n');
            break;

        case 'SET_ERC20_CERTIFICATE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.assetOwner,
                privateKey: action.data.assetOwnerPK
            };

            try {
                let certificate = await new Certificate.Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();

                await certificate.setOnChainDirectPurchasePrice(action.data.price);
                certificate = await certificate.sync();

                const erc20TestAddress = (await deployERC20TestToken(
                    conf.blockchainProperties.web3,
                    action.data.testAccount,
                    adminPK
                )).contractAddress;

                const erc20TestToken = new Erc20TestToken(
                    conf.blockchainProperties.web3,
                    erc20TestAddress
                );
                await certificate.setTradableToken(erc20TestAddress);
                certificate = await certificate.sync();
                conf.logger.info('Demo ERC token created: ' + erc20TestAddress);

                // save in global storage
                const erc20Config = {} as any;
                erc20Config.ERC20Address = erc20TestAddress;

                const writeJsonFile = require('write-json-file');
                await writeJsonFile('./config/erc20Config.json', erc20Config);
            } catch (e) {
                conf.logger.error('Could not set ERC20 tokens for certificate trading\n', e);
            }

            console.log('-----------------------------------------------------------\n');

            break;
        case 'BUY_CERTIFICATE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.buyer,
                privateKey: action.data.buyerPK
            };

            const erc20Config = JSON.parse(
                fs.readFileSync('./config/erc20Config.json', 'utf8').toString()
            );

            const erc20TestToken = new Erc20TestToken(
                conf.blockchainProperties.web3,
                erc20Config.ERC20Address
            );
            await erc20TestToken.approve(action.data.assetOwner, action.data.price, {
                privateKey: action.data.buyerPK
            });
            conf.logger.verbose(
                'Allowance: ' +
                    (await erc20TestToken.allowance(action.data.buyer, action.data.assetOwner))
            );

            try {
                conf.logger.verbose(
                    'Buyer Balance(BEFORE): ' +
                        (await Certificate.TradableEntity.getBalance(action.data.buyer, conf))
                );
                const certificate = await new Certificate.Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();
                await certificate.buyCertificate();
                conf.logger.info('Certificate Bought');
                conf.logger.verbose(
                    'Buyer Balance(AFTER): ' +
                        (await Certificate.TradableEntity.getBalance(action.data.buyer, conf))
                );
            } catch (e) {
                conf.logger.error('Could not buy Certificates\n' + e);
            }

            console.log('-----------------------------------------------------------\n');
            break;

        default:
            const passString = JSON.stringify(action);
            await onboardDemo(passString, conf, adminPK);
    }
};
