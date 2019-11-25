import { ConsumingAsset, ProducingAsset } from '@energyweb/asset-registry';
import { Configuration, Currency } from '@energyweb/utils-general';
import { CertificateLogic, Certificate } from '@energyweb/origin';
import { PurchasableCertificate, Contracts as MarketContracts } from '@energyweb/market';

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

    const certificateLogic: CertificateLogic = conf.blockchainProperties.certificateLogicInstance;

    switch (action.type) {
        case 'APPROVE_CERTIFICATION_REQUEST':
            console.log('-----------------------------------------------------------');

            try {
                await certificateLogic.approveCertificationRequest(
                    action.data.certificationRequestIndex,
                    {
                        privateKey: action.data.issuerPK
                    }
                );

                conf.logger.info(
                    `Certification request #${action.data.certificationRequestIndex} approved`
                );
            } catch (e) {
                conf.logger.error(
                    `Could not approve certification request #${action.data.certificationRequestIndex}\n`,
                    e
                );
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
                let asset = await new ProducingAsset.Entity(
                    (action.data.assetId as string),
                    conf
                ).sync();
                await asset.saveSmartMeterRead(
                    action.data.meterreading,
                    action.data.filehash,
                    action.data.timestamp || 0
                );
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
                await asset.saveSmartMeterRead(
                    action.data.meterreading,
                    action.data.filehash,
                    action.data.timestamp || 0
                );
                asset = await asset.sync();
                conf.logger.verbose('Consuming meter reading saved');
            } catch (e) {
                conf.logger.error('Could not save smart meter reading for consuming asset\n' + e);
            }

            console.log('-----------------------------------------------------------\n');

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
                        (await certificateLogic.balanceOf(action.data.assetOwner))
                );
                conf.logger.verbose(
                    'Asset Owner Balance(BEFORE): ' +
                        (await certificateLogic.balanceOf(action.data.addressTo))
                );
                const certificate = await new Certificate.Entity(action.data.certId, conf).sync();
                await certificate.transferFrom(action.data.addressTo);
                conf.logger.info('Certificate Transferred');
                conf.logger.verbose(
                    'Asset Owner Balance(AFTER): ' +
                        (await certificateLogic.balanceOf(action.data.assetOwner))
                );
                conf.logger.verbose(
                    'Asset Owner Balance(AFTER): ' +
                        (await certificateLogic.balanceOf(action.data.addressTo))
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
                let certificate = await new Certificate.Entity(action.data.certId, conf).sync();
                await certificate.splitCertificate(action.data.splitValue);
                certificate = await certificate.sync();

                conf.logger.info('Certificate Split into:', certificate.children);

                for (const cId of certificate.children) {
                    const c = await new Certificate.Entity(cId.toString(), conf).sync();
                    conf.logger.info('Child Certificate #' + cId + ' - energy: ' + c.energy);
                }
            } catch (e) {
                conf.logger.error('Could not split certificates\n' + e);
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
                let certificate = await new PurchasableCertificate.Entity(action.data.certId, conf).sync();

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
                let certificate = await new PurchasableCertificate.Entity(action.data.certId, conf).sync();

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
                await certificateLogic.requestCertificates(
                    assetId,
                    action.data.lastRequestedSMRead,
                    {
                        privateKey: action.data.assetOwnerPK
                    }
                );

                conf.logger.info(
                    `Requested certificates for asset ${assetId} up to SM read ${action.data.lastRequestedSMRead}`
                );
            } catch (e) {
                conf.logger.error(
                    `Could not request certificates for asset ${assetId} up to SM read ${action.data.lastRequestedSMRead}\n`,
                    e
                );
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
                let certificate = await new PurchasableCertificate.Entity(action.data.certId, conf).sync();

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
            const erc20TestToken = new MarketContracts.Erc20TestToken(
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
                        (await certificateLogic.balanceOf(action.data.buyer))
                );
                const certificate = await new PurchasableCertificate.Entity(action.data.certId, conf).sync();
                await certificate.buyCertificate();
                conf.logger.info('Certificate Bought');
                conf.logger.verbose(
                    'Buyer Balance(AFTER): ' +
                        (await certificateLogic.balanceOf(action.data.buyer))
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
                const cert = await new PurchasableCertificate.Entity(certId, conf).sync();
                const acceptedToken = (cert.acceptedToken as any) as string;

                if (acceptedToken !== '0x0000000000000000000000000000000000000000') {
                    const token = new MarketContracts.Erc20TestToken(
                        conf.blockchainProperties.web3,
                        erc20TestAddress
                    );

                    const currentAllowance = Number(
                        await token.allowance(action.data.buyer, cert.certificate.owner)
                    );
                    const price = Number(cert.onChainDirectPurchasePrice);

                    await token.approve(cert.certificate.owner, currentAllowance + price, {
                        from: action.data.buyer,
                        privateKey: ''
                    });

                    conf.logger.verbose(
                        `Buyer Balance ${await token.symbol()} (BEFORE): ` +
                            (await token.balanceOf(action.data.buyer))
                    );
                    conf.logger.verbose(
                        `Allowance: ${await token.allowance(action.data.buyer, cert.certificate.owner)}`
                    );
                }
            }

            try {
                await conf.blockchainProperties.certificateLogicInstance.buyCertificateBulk(
                    action.data.certificateIds,
                    {
                        from: action.data.buyer
                    }
                );
                conf.logger.info(
                    `Certificates ${action.data.certificateIds.join(', ')} bought on bulk`
                );
            } catch (e) {
                conf.logger.error(
                    `Could not bulk buy Certificates ${action.data.certificateIds.join(', ')}\n` + e
                );
            }

            console.log('-----------------------------------------------------------\n');
            break;

        default:
            const passString = JSON.stringify(action);
            await onboardDemo(passString, conf, adminPK);
    }
};
