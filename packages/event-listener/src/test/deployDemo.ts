import Web3 from 'web3';
import * as Winston from 'winston';

import { Asset, AssetLogic, ProducingAsset } from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { MarketLogic, Demand, MarketUser, PurchasableCertificate } from '@energyweb/market';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';
import { CertificateLogic } from '@energyweb/origin';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { buildRights, Role, User, UserLogic } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';

import { Configuration, TimeFrame, Currency, Compliance, Unit } from '@energyweb/utils-general';
import moment from 'moment';
import { IOffChainDataClient } from '@energyweb/origin-backend-client';

export class Demo {
    public marketContractLookup: string;

    public marketLogic: MarketLogic;

    public certificateLogic: CertificateLogic;

    public assetLogic: AssetLogic;

    public userLogic: UserLogic;

    private nextDeployedSmReadIndex = 0;

    private conf: Configuration.Entity;

    private adminPK: string;

    private web3: Web3;

    private ACCOUNTS: any;

    private logger: Winston.Logger;

    constructor(public web3Url: string, public deployKey: string, listenerPK: string) {
        this.adminPK = deployKey;
        this.web3 = new Web3(web3Url);

        this.ACCOUNTS = {
            ADMIN: {
                address: this.web3.eth.accounts.privateKeyToAccount(this.adminPK).address,
                privateKey: this.adminPK
            },
            ASSET_MANAGER: {
                address: '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
                privateKey: '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac'
            },
            SMART_METER: {
                address: '0x6cc53915dbec95a66deb7c709c800cac40ee55f9',
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            },
            MATCHER: {
                address: '0x3409c66069b3C4933C654beEAA136cc5ce6D7BD0'.toLowerCase(),
                privateKey: '0x554f3c1470e9f66ed2cf1dc260d2f4de77a816af2883679b1dc68c551e8fa5ed'
            },
            TRADER: {
                address: '0xb00f0793d0ce69d7b07db16f92dc982cd6bdf651',
                privateKey: '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e'
            },
            LISTENER: {
                address: this.web3.eth.accounts.privateKeyToAccount(listenerPK).address,
                privateKey: listenerPK
            }
        };

        this.logger = Winston.createLogger({
            level: 'verbose',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        });
    }

    get latestDeployedSmReadIndex(): number {
        return this.nextDeployedSmReadIndex - 1;
    }

    async deploy(offChainDataClient: IOffChainDataClient) {
        this.userLogic = await migrateUserRegistryContracts(this.web3, this.adminPK);
        const userLogicAddress = this.userLogic.web3Contract.options.address;

        this.assetLogic = await migrateAssetRegistryContracts(
            this.web3,
            userLogicAddress,
            this.adminPK
        );
        const assetLogicAddress = this.assetLogic.web3Contract.options.address;

        this.certificateLogic = await migrateCertificateRegistryContracts(
            this.web3,
            assetLogicAddress,
            this.adminPK
        );
        const certificateLogicAddress = this.certificateLogic.web3Contract.options.address;

        this.marketLogic = await migrateMarketRegistryContracts(
            this.web3,
            certificateLogicAddress,
            this.adminPK
        );

        const deployResult = {
            userLogic: '',
            assetLogic: '',
            certificateLogic: '',
            marketLogic: ''
        };

        this.marketContractLookup = this.marketLogic.web3Contract.options.address;

        deployResult.userLogic = userLogicAddress;
        deployResult.assetLogic = assetLogicAddress;
        deployResult.certificateLogic = certificateLogicAddress;
        deployResult.marketLogic = this.marketContractLookup;

        this.conf = {
            blockchainProperties: {
                activeUser: {
                    address: this.ACCOUNTS.ADMIN.address,
                    privateKey: this.adminPK
                },
                assetLogicInstance: this.assetLogic,
                certificateLogicInstance: this.certificateLogic,
                userLogicInstance: this.userLogic,
                marketLogicInstance: this.marketLogic,
                web3: this.web3
            },
            offChainDataSource: {
                baseUrl: `${process.env.BACKEND_URL}/api`,
                client: offChainDataClient
            },
            logger: this.logger
        };

        const adminPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.ADMIN.address,
            active: true,
            roles: buildRights([Role.UserAdmin, Role.AssetAdmin, Role.Issuer]),
            organization: 'admin'
        };
        const adminPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: 'Admin',
            surname: 'User',
            email: 'admin@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: ''
        };
        await MarketUser.createMarketUser(adminPropsOnChain, adminPropsOffChain, this.conf);

        const assetManagerPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.ASSET_MANAGER.address,
            active: true,
            roles: buildRights([Role.AssetAdmin, Role.AssetManager, Role.Trader]),
            organization: 'Asset Manager organization'
        };
        const assetManagerPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: 'Admin',
            surname: 'User',
            email: 'admin@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: '',
            notifications: true,
            autoPublish: {
                enabled: true,
                price: 1000,
                currency: Currency.USD
            }
        };
        await MarketUser.createMarketUser(
            assetManagerPropsOnChain,
            assetManagerPropsOffChain,
            this.conf
        );

        const listenerPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.LISTENER.address,
            active: true,
            roles: buildRights([Role.Listener]),
            organization: 'Listener organization'
        };
        const listenerPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: 'Listener',
            surname: 'L',
            email: 'listener@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: ''
        };
        await MarketUser.createMarketUser(listenerPropsOnChain, listenerPropsOffChain, this.conf);

        const matcherPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.MATCHER.address,
            active: true,
            roles: buildRights([Role.Matcher]),
            organization: 'Matcher organization'
        };
        const matcherPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: 'Matcher',
            surname: 'M',
            email: 'matcher@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: ''
        };
        await MarketUser.createMarketUser(matcherPropsOnChain, matcherPropsOffChain, this.conf);

        const marketLogicPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.conf.blockchainProperties.marketLogicInstance.web3Contract._address,
            active: true,
            roles: buildRights([Role.Matcher]),
            organization: 'MarketLogic matcher'
        };
        const marketLogicPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: 'MarketLogic',
            surname: 'Matcher',
            email: 'marketlogicmatcher@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: ''
        };

        await MarketUser.createMarketUser(
            marketLogicPropsOnChain,
            marketLogicPropsOffChain,
            this.conf
        );

        const traderOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.TRADER.address,
            active: true,
            roles: buildRights([Role.Trader]),
            organization: 'Trader'
        };
        const traderOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: 'Trader',
            surname: 'Trader',
            email: 'marketlogicmatcher@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: '',
            notifications: true
        };
        await MarketUser.createMarketUser(traderOnChain, traderOffChain, this.conf);

        const assetProducingProps: Asset.IOnChainProperties = {
            smartMeter: { address: this.ACCOUNTS.SMART_METER.address },
            owner: { address: this.ACCOUNTS.ASSET_MANAGER.address },
            lastSmartMeterReadWh: 0,
            active: true,
            usageType: Asset.UsageType.Producing,
            lastSmartMeterReadFileHash: '',
            propertiesDocumentHash: null,
            url: null
        };

        const assetProducingPropsOffChain: ProducingAsset.IOffChainProperties = {
            assetType: 'Wind',
            complianceRegistry: Compliance.IREC,
            facilityName: 'Wuthering Heights Windfarm',
            capacityWh: 0,
            country: 'Thailand',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '',
            gpsLongitude: '',
            timezone: 'Asia/Bangkok',
            operationalSince: 0,
            otherGreenAttributes: '',
            typeOfPublicSupport: ''
        };

        try {
            await ProducingAsset.createAsset(
                assetProducingProps,
                assetProducingPropsOffChain,
                this.conf
            );
        } catch (error) {
            throw new Error(error);
        }

        return { conf: this.conf, deployResult };
    }

    async deploySmartMeterRead(smRead: number): Promise<void> {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.ASSET_MANAGER;

        await this.assetLogic.saveSmartMeterRead(
            0,
            smRead,
            'newSmartMeterRead',
            this.nextDeployedSmReadIndex,
            {
                privateKey: this.ACCOUNTS.SMART_METER.privateKey
            }
        );
        await this.certificateLogic.requestCertificates(0, this.nextDeployedSmReadIndex, {
            privateKey: this.ACCOUNTS.ASSET_MANAGER.privateKey
        });
        await this.certificateLogic.approveCertificationRequest(this.nextDeployedSmReadIndex, {
            privateKey: this.adminPK
        });

        this.nextDeployedSmReadIndex += 1;
    }

    async publishForSale(certificateId: number) {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.ASSET_MANAGER;

        const deployedCertificate = await new PurchasableCertificate.Entity(
            certificateId.toString(),
            this.conf
        ).sync();
        await deployedCertificate.publishForSale(1000, Currency.USD);
    }

    async deployDemand() {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.TRADER;

        const demandOffChainProps: Demand.IDemandOffChainProperties = {
            timeFrame: TimeFrame.hourly,
            maxPricePerMwh: 150000,
            currency: Currency.USD,
            location: ['Thailand;Central;Nakhon Pathom'],
            assetType: ['Wind'],
            minCO2Offset: 10,
            otherGreenAttributes: 'string',
            typeOfPublicSupport: 'string',
            energyPerTimeFrame: 1 * Unit.MWh,
            registryCompliance: Compliance.EEC,
            startTime: moment().unix(),
            endTime: moment()
                .add(1, 'hour')
                .unix()
        };

        return Demand.createDemand(demandOffChainProps, this.conf);
    }

    async fillDemand(demandId: string, certId: string) {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.MATCHER;

        const demand = await new Demand.Entity(demandId, this.conf).sync();
        const certificate = await new PurchasableCertificate.Entity(certId, this.conf).sync();
        const fillTx = await demand.fill(certificate.id);

        return fillTx.status;
    }

    async isForSale(certId: string) {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.LISTENER;
        const certificate = await new PurchasableCertificate.Entity(certId, this.conf).sync();

        return certificate.forSale;
    }
}
