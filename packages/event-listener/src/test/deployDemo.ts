import axios from 'axios';
import Web3 from 'web3';
import * as Winston from 'winston';

import {
    AssetConsumingRegistryLogic,
    AssetProducingRegistryLogic,
    migrateAssetRegistryContracts,
    ProducingAsset
} from '@energyweb/asset-registry';
import { MarketLogic, migrateMarketRegistryContracts, Demand } from '@energyweb/market';
import { CertificateLogic, Certificate } from '@energyweb/origin';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import {
    buildRights,
    migrateUserRegistryContracts,
    Role,
    User,
    UserLogic
} from '@energyweb/user-registry';

import { Configuration, TimeFrame, Currency, Compliance } from '@energyweb/utils-general';

export class Demo {
    public originContractLookup;

    public certificateLogic;

    public assetProducingRegistryLogic;

    private connectionConfig;

    private conf: Configuration.Entity;

    private adminPK;

    private web3;

    private ACCOUNTS;

    private logger;

    private latestDeployedSmReadIndex = 0;

    constructor(web3Url: string, deployKey: string) {
        this.connectionConfig = {
            web3: web3Url,
            deployKey
        };

        this.adminPK = this.connectionConfig.deployKey;
        this.web3 = new Web3(this.connectionConfig.web3);

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
            }
        };

        this.logger = Winston.createLogger({
            level: 'debug',
            format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
            transports: [new Winston.transports.Console({ level: 'silly' })]
        });
    }

    async deploy() {
        const userContracts: any = await migrateUserRegistryContracts(this.web3, this.adminPK);
        const assetContracts: any = await migrateAssetRegistryContracts(
            this.web3,
            userContracts.UserContractLookup,
            this.adminPK
        );
        const originContracts: any = await migrateCertificateRegistryContracts(
            this.web3,
            assetContracts.AssetContractLookup,
            this.adminPK
        );
        const marketContracts: any = await migrateMarketRegistryContracts(
            this.web3,
            assetContracts.AssetContractLookup,
            this.adminPK
        );

        const deployResult = {
            userContractLookup: '',
            assetContractLookup: '',
            originContractLookup: '',
            marketContractLookup: '',
            userLogic: '',
            assetConsumingRegistryLogic: '',
            assetProducingRegistryLogic: '',
            certificateLogic: '',
            marketLogic: ''
        };

        this.originContractLookup = originContracts.OriginContractLookup;

        deployResult.userContractLookup = userContracts.UserContractLookup;
        deployResult.assetContractLookup = assetContracts.AssetContractLookup;
        deployResult.originContractLookup = originContracts.OriginContractLookup;
        deployResult.marketContractLookup = marketContracts.MarketContractLookup;
        deployResult.userLogic = userContracts.UserLogic;
        deployResult.assetConsumingRegistryLogic = assetContracts.AssetConsumingRegistryLogic;
        deployResult.assetProducingRegistryLogic = assetContracts.AssetProducingRegistryLogic;
        deployResult.certificateLogic = originContracts.CertificateLogic;
        deployResult.marketLogic = marketContracts.MarketLogic;

        await axios.put(
            `${
                process.env.API_BASE_URL
            }/OriginContractLookupMarketLookupMapping/${deployResult.originContractLookup.toLowerCase()}`,
            {
                marketContractLookup: deployResult.marketContractLookup.toLowerCase()
            }
        );

        const userLogic = new UserLogic(this.web3, deployResult.userLogic);
        this.assetProducingRegistryLogic = new AssetProducingRegistryLogic(
            this.web3,
            deployResult.assetProducingRegistryLogic
        );
        const assetConsumingRegistryLogic = new AssetConsumingRegistryLogic(
            this.web3,
            deployResult.assetConsumingRegistryLogic
        );
        this.certificateLogic = new CertificateLogic(this.web3, deployResult.certificateLogic);
        const marketLogic = new MarketLogic(this.web3, deployResult.marketLogic);

        this.conf = {
            blockchainProperties: {
                activeUser: {
                    address: this.ACCOUNTS.ADMIN.address,
                    privateKey: this.adminPK
                },
                producingAssetLogicInstance: this.assetProducingRegistryLogic,
                consumingAssetLogicInstance: assetConsumingRegistryLogic,
                certificateLogicInstance: this.certificateLogic,
                userLogicInstance: userLogic,
                marketLogicInstance: marketLogic,
                web3: this.web3
            },
            offChainDataSource: {
                baseUrl: process.env.API_BASE_URL
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
        const adminPropsOffChain: User.IUserOffChainProperties = {
            firstName: 'Admin',
            surname: 'User',
            email: 'admin@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: '',
            notifications: true
        };
        await User.createUser(adminPropsOnChain, adminPropsOffChain, this.conf);

        const assetManagerPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.ASSET_MANAGER.address,
            active: true,
            roles: buildRights([Role.AssetAdmin, Role.AssetManager, Role.Trader]),
            organization: 'Asset Manager organization'
        };
        const assetManagerPropsOffChain: User.IUserOffChainProperties = {
            firstName: 'Admin',
            surname: 'User',
            email: 'admin@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: '',
            notifications: true
        };
        await User.createUser(assetManagerPropsOnChain, assetManagerPropsOffChain, this.conf);

        const assetProducingProps: ProducingAsset.IOnChainProperties = {
            smartMeter: { address: this.ACCOUNTS.SMART_METER.address },
            owner: { address: this.ACCOUNTS.ASSET_MANAGER.address },
            lastSmartMeterReadWh: 0,
            active: true,
            lastSmartMeterReadFileHash: '',
            propertiesDocumentHash: null,
            url: null,
            maxOwnerChanges: 1000,
            matcher: []
        };

        const assetProducingPropsOffChain: ProducingAsset.IOffChainProperties = {
            assetType: 'Wind',
            complianceRegistry: Compliance.IREC,
            facilityName: 'Wuthering Heights Windfarm',
            capacityWh: 0,
            city: 'Warsaw',
            country: 'Poland',
            gpsLatitude: '',
            gpsLongitude: '',
            houseNumber: '1',
            operationalSince: 0,
            otherGreenAttributes: '',
            region: 'Mazovian',
            street: 'Backstreet',
            typeOfPublicSupport: '',
            zip: '00-000'
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
        await this.assetProducingRegistryLogic.saveSmartMeterRead(
            0,
            smRead,
            'newSmartMeterRead',
            this.latestDeployedSmReadIndex,
            {
                privateKey: this.ACCOUNTS.SMART_METER.privateKey
            }
        );
        await this.certificateLogic.requestCertificates(0, this.latestDeployedSmReadIndex, {
            privateKey: this.ACCOUNTS.ASSET_MANAGER.privateKey
        });
        await this.certificateLogic.approveCertificationRequest(this.latestDeployedSmReadIndex, {
            privateKey: this.adminPK
        });

        this.latestDeployedSmReadIndex += 1;
    }

    async publishForSale(certificateId: number) {
        const deployedCertificate = await new Certificate.Entity(
            certificateId.toString(),
            this.conf
        ).sync();
        await deployedCertificate.publishForSale(1000, Currency.USD);
        console.log('PUBLISHED FOR SALE');
    }

    async deployDemand() {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.ASSET_MANAGER;

        const demandOffChainProps: Demand.IDemandOffChainProperties = {
            timeFrame: TimeFrame.hourly,
            maxPricePerMwh: 150000,
            currency: Currency.USD,
            producingAsset: '0',
            location: { provinces: ['string'], regions: ['string'] },
            assetType: ['Wind'],
            minCO2Offset: 10,
            otherGreenAttributes: 'string',
            typeOfPublicSupport: 'string',
            targetWhPerPeriod: 1e6,
            registryCompliance: Compliance.EEC,
            startTime: '1559466472732',
            endTime: '1559466492732'
        };

        return Demand.createDemand(demandOffChainProps, this.conf);
    }
}
