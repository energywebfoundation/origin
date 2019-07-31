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

import { Erc20TestToken } from 'ew-erc-test-contracts';
import { Certificate, TradableEntity } from 'ew-origin-lib';
import { ConsumingAsset, ProducingAsset } from 'ew-asset-registry-lib';
import { Configuration, Currency } from 'ew-utils-general-lib';
import { CertificateLogic } from 'ew-origin-lib';

import { onboardDemo } from './onboarding';

export const certificateDemo = async (
    actionString: string,
    conf: Configuration.Entity,
    adminPrivateKey: string,
    erc20TestAddress: string
) => {
    const action = JSON.parse(actionString);

    const adminPK = adminPrivateKey.startsWith('0x') ? adminPrivateKey : '0x' + adminPrivateKey;

    const adminAccount = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(adminPK);

    const certificateLogic : CertificateLogic = conf.blockchainProperties.certificateLogicInstance;

    switch (action.type) {
        case 'APPROVE_CERTIFICATION_REQUEST':
            console.log('-----------------------------------------------------------');

            try {
                await certificateLogic.approveCertificationRequest(action.data.certificationRequestIndex, {
                    privateKey: action.data.issuerPK
                });

                conf.logger.info(`Certification request #${action.data.certificationRequestIndex} approved`);
            } catch (e) {
                conf.logger.error(`Could not approve certification request #${action.data.certificationRequestIndex}\n`, e);
            }

            console.log('-----------------------------------------------------------\n');
            break;
        case 'SAVE_SMARTMETER_READ_PRODUCING':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.smartMeter,
                privateKey: action.data.smartMeterPK
            };

            try {
                let asset = await new ProducingAsset.Entity(action.data.assetId, conf).sync();
                await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash, action.data.timestamp || 0);
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
                let asset = await new ConsumingAsset.Entity(action.data.assetId, conf).sync();
                await asset.saveSmartMeterRead(action.data.meterreading, action.data.filehash, action.data.timestamp || 0);
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
                        (await TradableEntity.getBalance(action.data.assetOwner, conf))
                );
                conf.logger.verbose(
                    'Asset Owner Balance(BEFORE): ' +
                        (await TradableEntity.getBalance(action.data.addressTo, conf))
                );
                const certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();
                await certificate.transferFrom(action.data.addressTo);
                conf.logger.info('Certificate Transferred');
                conf.logger.verbose(
                    'Asset Owner Balance(AFTER): ' +
                        (await TradableEntity.getBalance(action.data.assetOwner, conf))
                );
                conf.logger.verbose(
                    'Asset Owner Balance(AFTER): ' +
                        (await TradableEntity.getBalance(action.data.addressTo, conf))
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
                let certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();
                await certificate.splitCertificate(action.data.splitValue);
                certificate = await certificate.sync();

                conf.logger.info('Certificate Split into:', certificate.children);

                for (const cId of certificate.children) {
                    const c = await new Certificate.Entity(cId.toString(), conf).sync();
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
                let certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();

                await certificate.setOnChainDirectPurchasePrice(action.data.price);
                certificate = await certificate.sync();

                await certificate.setTradableToken(erc20TestAddress);
                certificate = await certificate.sync();
                conf.logger.info('Demo ERC token created: ' + erc20TestAddress);
            } catch (e) {
                conf.logger.error('Could not set ERC20 tokens for certificate trading\n', e);
            }

            console.log('-----------------------------------------------------------\n');

            break;
        case 'PUBLISH_CERTIFICATE_FOR_SALE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.certificateOwner,
                privateKey: action.data.certificateOwnerPK
            };

            try {
                let certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();

                await certificate.publishForSale(action.data.price, erc20TestAddress);
                certificate = await certificate.sync();

                conf.logger.info(`Certificate ${action.data.certId} published for sale`);
            } catch (e) {
                conf.logger.error(`Could not set publish ${action.data.certId} for sale\n`, e);
            }

            console.log('-----------------------------------------------------------\n');
            break;
        case 'PUBLISH_CERTIFICATE_FOR_SALE_OFFCHAIN':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.certificateOwner,
                privateKey: action.data.certificateOwnerPK
            };
            try {
                let certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();

                await certificate.publishForSale(action.data.price, Currency[action.data.currency]);
                certificate = await certificate.sync();

                conf.logger.info(`Certificate ${action.data.certId} published for sale`);
            } catch (e) {
                conf.logger.error(`Could not set publish ${action.data.certId} for sale\n`, e);
            }

            console.log('-----------------------------------------------------------\n');
            break;
        case 'REQUEST_CERTIFICATES':
            console.log('-----------------------------------------------------------');

            const assetId = Number(action.data.assetId);

            try {
                await certificateLogic.requestCertificates(assetId, action.data.lastRequestedSMRead, {
                    privateKey: action.data.assetOwnerPK
                });

                conf.logger.info(`Requested certificates for asset ${assetId} up to SM read ${action.data.lastRequestedSMRead}`);
            } catch (e) {
                conf.logger.error(`Could not request certificates for asset ${assetId} up to SM read ${action.data.lastRequestedSMRead}\n`, e);
            }

            console.log('-----------------------------------------------------------\n');
            break;
        case 'UNPUBLISH_CERTIFICATE_FROM_SALE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.certificateOwner,
                privateKey: action.data.certificateOwnerPK
            };

            try {
                let certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();

                await certificate.unpublishForSale();
                certificate = await certificate.sync();

                conf.logger.info(`Certificate ${action.data.certId} unpublished from sale`);
            } catch (e) {
                conf.logger.error(`Could not set unpublish ${action.data.certId} from sale\n`, e);
            }

            console.log('-----------------------------------------------------------\n');
            break;
        case 'BUY_CERTIFICATE':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.buyer,
                privateKey: action.data.buyerPK
            };
            const erc20TestToken = new Erc20TestToken(
                conf.blockchainProperties.web3,
                erc20TestAddress
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
                        (await TradableEntity.getBalance(action.data.buyer, conf))
                );
                const certificate = await new Certificate.Entity(
                    action.data.certId,
                    conf
                ).sync();
                await certificate.buyCertificate();
                conf.logger.info('Certificate Bought');
                conf.logger.verbose(
                    'Buyer Balance(AFTER): ' +
                        (await TradableEntity.getBalance(action.data.buyer, conf))
                );
            } catch (e) {
                conf.logger.error('Could not buy Certificates\n' + e);
            }

            console.log('-----------------------------------------------------------\n');
            break;

        case 'BUY_CERTIFICATE_BULK':
            console.log('-----------------------------------------------------------');

            conf.blockchainProperties.activeUser = {
                address: action.data.buyer,
                privateKey: action.data.buyerPK
            };

            for (const certId of action.data.certificateIds) {
                const cert = await new Certificate.Entity(certId, conf).sync();
                const acceptedToken = (cert.acceptedToken as any) as string;

                if (acceptedToken !== '0x0000000000000000000000000000000000000000') {
                    const token = new Erc20TestToken(
                        conf.blockchainProperties.web3,
                        erc20TestAddress
                    );

                    const currentAllowance = Number(await token.allowance(action.data.buyer, cert.owner));
                    const price = Number(cert.onChainDirectPurchasePrice);

                    await token.approve(cert.owner, currentAllowance + price, {
                        from: action.data.buyer,
                        privateKey: ''
                    });

                    conf.logger.verbose(
                        `Buyer Balance ${await token.symbol()} (BEFORE): ` +
                            (await token.balanceOf(action.data.buyer))
                    );
                    conf.logger.verbose(`Allowance: ${await token.allowance(action.data.buyer, cert.owner)}`);
                }
            }

            try {
                await conf.blockchainProperties.certificateLogicInstance.buyCertificateBulk(action.data.certificateIds, {
                    from: action.data.buyer
                });
                conf.logger.info(`Certificates ${action.data.certificateIds.join(', ')} bought on bulk`);
            } catch (e) {
                conf.logger.error(`Could not bulk buy Certificates ${action.data.certificateIds.join(', ')}\n` + e);
            }

            console.log('-----------------------------------------------------------\n');
            break;

        default:
            const passString = JSON.stringify(action);
            await onboardDemo(passString, conf, adminPK);
    }
};
