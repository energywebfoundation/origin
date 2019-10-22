import {
    AssetConsumingRegistryLogic,
    AssetProducingRegistryLogic,
    ProducingAsset
} from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { Agreement, Demand, MarketLogic, Supply } from '@energyweb/market';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';
import { Certificate, CertificateLogic } from '@energyweb/origin';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { buildRights, Role, UserLogic } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { Compliance, Configuration, Currency, TimeFrame } from '@energyweb/utils-general';
import dotenv from 'dotenv';
import moment from 'moment';
import Web3 from 'web3';

import { IMatcherConfig } from '..';
import { logger } from '../Logger';

dotenv.config({
    path: '.env.test'
});

const web3: Web3 = new Web3(process.env.WEB3);
const deployKey: string = process.env.DEPLOY_KEY;

const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

const assetOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
const assetOwnerAddress = web3.eth.accounts.privateKeyToAccount(assetOwnerPK).address;

const assetSmartMeterPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
const assetSmartMeter = web3.eth.accounts.privateKeyToAccount(assetSmartMeterPK).address;

const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

const deployUserRegistry = async () => {
    const userContracts = await migrateUserRegistryContracts(web3, privateKeyDeployment);
    const userContractLookupAddress = (userContracts as any).UserContractLookup;

    const userLogic = new UserLogic(web3, (userContracts as any).UserLogic);
    await userLogic.createUser(
        'propertiesDocumentHash',
        'documentDBURL',
        accountDeployment,
        'admin',
        { privateKey: privateKeyDeployment }
    );

    await userLogic.setRoles(
        accountDeployment,
        buildRights([
            Role.UserAdmin,
            Role.AssetAdmin,
            Role.AssetManager,
            Role.Trader,
            Role.Matcher
        ]),
        { privateKey: privateKeyDeployment }
    );

    await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', accountTrader, 'trader', {
        privateKey: privateKeyDeployment
    });

    await userLogic.setRoles(accountTrader, buildRights([Role.Trader]), {
        privateKey: privateKeyDeployment
    });

    await userLogic.createUser(
        'propertiesDocumentHash',
        'documentDBURL',
        assetOwnerAddress,
        'assetOwner',
        { privateKey: privateKeyDeployment }
    );
    await userLogic.setRoles(assetOwnerAddress, buildRights([Role.AssetManager]), {
        privateKey: privateKeyDeployment
    });

    await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', issuerAccount, 'issuer', {
        privateKey: privateKeyDeployment
    });

    await userLogic.setRoles(issuerAccount, buildRights([Role.Issuer]), {
        privateKey: privateKeyDeployment
    });

    return { userLogic, userContractLookupAddress };
};

const deployAssetRegistry = async (userContractLookupAddress: string) => {
    const assetRegistryContracts = await migrateAssetRegistryContracts(
        web3,
        userContractLookupAddress,
        privateKeyDeployment
    );
    const assetProducingRegistry = new AssetProducingRegistryLogic(
        web3 as any,
        (assetRegistryContracts as any).AssetProducingRegistryLogic
    );
    const assetContractLookupAddress = (assetRegistryContracts as any).AssetContractLookup;

    return { assetProducingRegistry, assetContractLookupAddress };
};

const deployCertificateRegistry = async (assetContractLookupAddress: string) => {
    const certificateRegistryContracts = await migrateCertificateRegistryContracts(
        web3,
        assetContractLookupAddress,
        privateKeyDeployment
    );
    const certificateLogic = new CertificateLogic(
        web3 as any,
        (certificateRegistryContracts as any).CertificateLogic
    );

    const originContractLookupAddress = (certificateRegistryContracts as any).OriginContractLookup;

    return { certificateLogic, originContractLookupAddress };
};

const deployMarket = async (
    assetContractLookupAddress: string,
    originContractLookupAddress: string,
    userLogic: UserLogic
) => {
    const deployedContracts = await migrateMarketRegistryContracts(
        web3 as any,
        assetContractLookupAddress,
        originContractLookupAddress,
        privateKeyDeployment
    );

    const marketLogicAddress: string = (deployedContracts as any).MarketLogic;

    const marketLogic = new MarketLogic(web3, marketLogicAddress);
    const marketContractLookupAddress = (deployedContracts as any).MarketContractLookup;

    await userLogic.createUser(
        'propertiesDocumentHash',
        'documentDBURL',
        marketLogicAddress,
        'matcher',
        { privateKey: privateKeyDeployment }
    );

    await userLogic.setRoles(marketLogicAddress, buildRights([Role.Matcher]), {
        privateKey: privateKeyDeployment
    });

    return { marketLogic, marketContractLookupAddress };
};

const changeUser = (
    config: Configuration.Entity,
    activeUser: { address: string; privateKey: string }
) =>
    ({
        ...config,
        blockchainProperties: { ...config.blockchainProperties, activeUser }
    } as Configuration.Entity);

const deploy = async () => {
    const { userLogic, userContractLookupAddress } = await deployUserRegistry();
    const { assetProducingRegistry, assetContractLookupAddress } = await deployAssetRegistry(
        userContractLookupAddress
    );
    const { certificateLogic, originContractLookupAddress } = await deployCertificateRegistry(
        assetContractLookupAddress
    );

    const { marketLogic, marketContractLookupAddress } = await deployMarket(
        assetContractLookupAddress,
        originContractLookupAddress,
        userLogic
    );

    const config = {
        blockchainProperties: {
            activeUser: {
                address: accountTrader,
                privateKey: traderPK
            },
            userLogicInstance: userLogic,
            producingAssetLogicInstance: assetProducingRegistry,
            marketLogicInstance: marketLogic,
            certificateLogicInstance: certificateLogic,
            web3
        },
        offChainDataSource: {
            baseUrl: process.env.BACKEND_URL
        },
        logger
    } as Configuration.Entity<
        MarketLogic,
        AssetProducingRegistryLogic,
        AssetConsumingRegistryLogic,
        CertificateLogic,
        UserLogic
    >;

    const matcherConfig = {
        web3Url: process.env.WEB3,
        offChainDataSourceUrl: process.env.BACKEND_URL,
        marketContractLookupAddress,
        matcherAccount: {
            address: accountDeployment,
            privateKey: privateKeyDeployment
        }
    } as IMatcherConfig;

    return { config, matcherConfig };
};

const deployDemand = async (
    config: Configuration.Entity,
    requiredEnergy: number,
    price = 150,
    currency: Currency = Currency.USD
) => {
    const traderConfig = changeUser(config, {
        address: accountTrader,
        privateKey: traderPK
    });

    const demandOffChainProps: Demand.IDemandOffChainProperties = {
        timeFrame: TimeFrame.hourly,
        maxPricePerMwh: price,
        currency,
        location: ['Thailand;Central;Nakhon Pathom'],
        assetType: ['Solar'],
        minCO2Offset: 10,
        otherGreenAttributes: 'string',
        typeOfPublicSupport: 'string',
        energyPerTimeFrame: requiredEnergy,
        registryCompliance: Compliance.EEC,
        startTime: moment().unix(),
        endTime: moment()
            .add(1, 'hour')
            .unix()
    };

    return Demand.createDemand(demandOffChainProps, traderConfig);
};

const deployAsset = (config: Configuration.Entity) => {
    const deployerConfig = changeUser(config, {
        address: accountDeployment,
        privateKey: privateKeyDeployment
    });

    const assetProps: ProducingAsset.IOnChainProperties = {
        smartMeter: { address: assetSmartMeter },
        owner: { address: assetOwnerAddress },
        lastSmartMeterReadWh: 0,
        active: true,
        lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
        propertiesDocumentHash: null,
        url: null,
        maxOwnerChanges: 3
    };

    const assetPropsOffChain: ProducingAsset.IOffChainProperties = {
        facilityName: 'MatcherTestFacility',
        operationalSince: 0,
        capacityWh: 10,
        country: 'Thailand',
        address: '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        gpsLatitude: '14.059500',
        gpsLongitude: '99.977800',
        timezone: 'Asia/Bangkok',
        assetType: 'Solar',
        complianceRegistry: Compliance.EEC,
        otherGreenAttributes: '',
        typeOfPublicSupport: ''
    };

    return ProducingAsset.createAsset(assetProps, assetPropsOffChain, deployerConfig);
};

const deploySupply = (
    config: Configuration.Entity,
    assetId: string,
    requiredEnergy: number,
    price = 150,
    currency: Currency = Currency.USD
) => {
    const assetOwnerConfig = changeUser(config, {
        address: assetOwnerAddress,
        privateKey: assetOwnerPK
    });

    return Supply.createSupply(
        {
            url: null,
            propertiesDocumentHash: null,
            assetId
        },
        {
            price,
            currency,
            availableWh: requiredEnergy,
            timeFrame: TimeFrame.hourly
        },
        assetOwnerConfig
    );
};

const deployCertificate = async (
    config: Configuration.Entity,
    assetId: string,
    requiredEnergy: number
) => {
    const certificateLogic = config.blockchainProperties
        .certificateLogicInstance as CertificateLogic;
    const smartMeterConfig = changeUser(config, {
        address: assetSmartMeter,
        privateKey: assetSmartMeterPK
    });
    const producingAsset = await new ProducingAsset.Entity(assetId, smartMeterConfig).sync();
    await producingAsset.saveSmartMeterRead(requiredEnergy, 'newMeterRead');

    await certificateLogic.requestCertificates(0, 0, {
        privateKey: assetOwnerPK
    });

    await certificateLogic.approveCertificationRequest(0, {
        privateKey: issuerPK
    });

    const assetOwnerConfig = changeUser(config, {
        address: assetOwnerAddress,
        privateKey: assetOwnerPK
    });

    return new Certificate.Entity('0', assetOwnerConfig).sync();
};

const deployAgreement = async (
    config: Configuration.Entity,
    demandId: string,
    supplyId: string,
    price = 150,
    currency: Currency = Currency.USD
) => {
    const traderConfig = changeUser(config, {
        address: accountTrader,
        privateKey: traderPK
    });

    const startTime = moment()
        .add(-1, 'day')
        .unix();
    const endTime = moment()
        .add(1, 'day')
        .unix();

    const agreementOffChainProps: Agreement.IAgreementOffChainProperties = {
        start: startTime,
        end: endTime,
        price,
        currency,
        period: 10,
        timeFrame: TimeFrame.hourly
    };

    const agreementProps: Agreement.IAgreementOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        demandId,
        supplyId
    };

    const agreement = await Agreement.createAgreement(
        agreementProps,
        agreementOffChainProps,
        traderConfig
    );

    const assetOwnerConfig = changeUser(config, {
        address: assetOwnerAddress,
        privateKey: assetOwnerPK
    });

    const assetOwnerAgreement = await new Agreement.Entity(agreement.id, assetOwnerConfig).sync();
    await assetOwnerAgreement.approveAgreementSupply();

    return assetOwnerAgreement.sync();
};

export {
    deploy,
    changeUser,
    deployDemand,
    deployCertificate,
    deployAsset,
    deploySupply,
    deployAgreement
};
