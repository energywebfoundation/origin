import dotenv from 'dotenv';
import moment from 'moment';
import Web3 from 'web3';

import {
    Device,
    ProducingDevice,
    DeviceLogic,
    Contracts as DeviceRegistryContracts
} from '@energyweb/asset-registry';
import {
    Agreement,
    Demand,
    MarketLogic,
    Supply,
    PurchasableCertificate,
    Contracts as MarketContracts
} from '@energyweb/market';
import { CertificateLogic, Contracts as OriginContracts } from '@energyweb/origin';
import {
    buildRights,
    Role,
    UserLogic,
    Contracts as UserRegistryContracts
} from '@energyweb/user-registry';
import { Compliance, Configuration, Currency, TimeFrame } from '@energyweb/utils-general';
import { OffChainDataClientMock } from '@energyweb/origin-backend-client';

import { IMatcherConfig } from '..';
import { logger } from '../Logger';

dotenv.config({
    path: '.env.test'
});

const web3: Web3 = new Web3(process.env.WEB3);
const deployKey: string = process.env.DEPLOY_KEY;

const privateKeyDeployment = deployKey.startsWith('0x') ? deployKey : `0x${deployKey}`;
const accountDeployment = web3.eth.accounts.privateKeyToAccount(privateKeyDeployment).address;

const deviceOwnerPK = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
const deviceOwnerAddress = web3.eth.accounts.privateKeyToAccount(deviceOwnerPK).address;

const deviceSmartMeterPK = '0xc4b87d68ea2b91f9d3de3fcb77c299ad962f006ffb8711900cb93d94afec3dc3';
const deviceSmartMeter = web3.eth.accounts.privateKeyToAccount(deviceSmartMeterPK).address;

const traderPK = '0xca77c9b06fde68bcbcc09f603c958620613f4be79f3abb4b2032131d0229462e';
const accountTrader = web3.eth.accounts.privateKeyToAccount(traderPK).address;

const issuerPK = '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac';
const issuerAccount = web3.eth.accounts.privateKeyToAccount(issuerPK).address;

const deployUserRegistry = async () => {
    const userLogic = await UserRegistryContracts.migrateUserRegistryContracts(
        web3,
        privateKeyDeployment
    );

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
            Role.DeviceAdmin,
            Role.DeviceManager,
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
        deviceOwnerAddress,
        'deviceOwner',
        { privateKey: privateKeyDeployment }
    );
    await userLogic.setRoles(deviceOwnerAddress, buildRights([Role.DeviceManager]), {
        privateKey: privateKeyDeployment
    });

    await userLogic.createUser('propertiesDocumentHash', 'documentDBURL', issuerAccount, 'issuer', {
        privateKey: privateKeyDeployment
    });

    await userLogic.setRoles(issuerAccount, buildRights([Role.Issuer]), {
        privateKey: privateKeyDeployment
    });

    return { userLogic };
};

const deployDeviceRegistry = async (userLogicAddress: string) => {
    const deviceLogic = await DeviceRegistryContracts.migrateDeviceRegistryContracts(
        web3,
        userLogicAddress,
        privateKeyDeployment
    );

    return { deviceLogic };
};

const deployCertificateRegistry = async (deviceLogicAddress: string) => {
    const certificateLogic = await OriginContracts.migrateCertificateRegistryContracts(
        web3,
        deviceLogicAddress,
        privateKeyDeployment
    );
    return { certificateLogic };
};

const deployMarket = async (originLogicAddress: string) => {
    const marketLogic = await MarketContracts.migrateMarketRegistryContracts(
        web3,
        originLogicAddress,
        privateKeyDeployment
    );

    return { marketLogic };
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
    const { userLogic } = await deployUserRegistry();
    const { deviceLogic } = await deployDeviceRegistry(userLogic.web3Contract.options.address);
    const { certificateLogic } = await deployCertificateRegistry(
        deviceLogic.web3Contract.options.address
    );
    const { marketLogic } = await deployMarket(certificateLogic.web3Contract.options.address);

    const marketLogicAddress = marketLogic.web3Contract.options.address;

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

    const config: Configuration.Entity<MarketLogic, DeviceLogic, CertificateLogic, UserLogic> = {
        blockchainProperties: {
            activeUser: {
                address: accountTrader,
                privateKey: traderPK
            },
            userLogicInstance: userLogic,
            deviceLogicInstance: deviceLogic,
            marketLogicInstance: marketLogic,
            certificateLogicInstance: certificateLogic,
            web3
        },
        offChainDataSource: {
            baseUrl: `${process.env.BACKEND_URL}/api`,
            client: new OffChainDataClientMock()
        },
        logger
    };

    const matcherConfig: IMatcherConfig = {
        web3Url: process.env.WEB3,
        offChainDataSourceUrl: `${process.env.BACKEND_URL}/api`,
        offChainDataSourceClient: config.offChainDataSource.client,
        marketLogicAddress,
        matcherAccount: {
            address: accountDeployment,
            privateKey: privateKeyDeployment
        },
        matcherInterval: 15
    };

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
        deviceType: ['Solar'],
        minCO2Offset: 10,
        otherGreenAttributes: 'string',
        typeOfPublicSupport: 'string',
        energyPerTimeFrame: requiredEnergy,
        registryCompliance: Compliance.EEC,
        startTime: moment().unix(),
        endTime: moment()
            .add(1, 'hour')
            .unix(),
        automaticMatching: true
    };

    return Demand.createDemand(demandOffChainProps, traderConfig);
};

const deployDevice = (config: Configuration.Entity) => {
    const deployerConfig = changeUser(config, {
        address: accountDeployment,
        privateKey: privateKeyDeployment
    });

    const deviceProps: Device.IOnChainProperties = {
        smartMeter: { address: deviceSmartMeter },
        owner: { address: deviceOwnerAddress },
        lastSmartMeterReadWh: 0,
        active: true,
        usageType: Device.UsageType.Producing,
        lastSmartMeterReadFileHash: 'lastSmartMeterReadFileHash',
        propertiesDocumentHash: null,
        url: null
    };

    const devicePropsOffChain: ProducingDevice.IOffChainProperties = {
        facilityName: 'MatcherTestFacility',
        operationalSince: 0,
        capacityWh: 10,
        country: 'Thailand',
        address: '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        gpsLatitude: '14.059500',
        gpsLongitude: '99.977800',
        timezone: 'Asia/Bangkok',
        deviceType: 'Solar',
        complianceRegistry: Compliance.EEC,
        otherGreenAttributes: '',
        typeOfPublicSupport: ''
    };

    return ProducingDevice.createDevice(deviceProps, devicePropsOffChain, deployerConfig);
};

const deploySupply = (
    config: Configuration.Entity,
    deviceId: string,
    requiredEnergy: number,
    price = 150,
    currency: Currency = Currency.USD
) => {
    const deviceOwnerConfig = changeUser(config, {
        address: deviceOwnerAddress,
        privateKey: deviceOwnerPK
    });

    return Supply.createSupply(
        {
            url: null,
            propertiesDocumentHash: null,
            deviceId
        },
        {
            price,
            currency,
            availableWh: requiredEnergy,
            timeFrame: TimeFrame.hourly
        },
        deviceOwnerConfig
    );
};

const deployCertificate = async (
    config: Configuration.Entity,
    deviceId: string,
    requiredEnergy: number
) => {
    const certificateLogic: CertificateLogic = config.blockchainProperties.certificateLogicInstance;

    const smartMeterConfig = changeUser(config, {
        address: deviceSmartMeter,
        privateKey: deviceSmartMeterPK
    });

    const producingDevice = await new ProducingDevice.Entity(deviceId, smartMeterConfig).sync();
    await producingDevice.saveSmartMeterRead(requiredEnergy, 'newMeterRead');

    await certificateLogic.requestCertificates(0, 0, {
        privateKey: deviceOwnerPK
    });

    await certificateLogic.approveCertificationRequest(0, {
        privateKey: issuerPK
    });

    const deviceOwnerConfig = changeUser(config, {
        address: deviceOwnerAddress,
        privateKey: deviceOwnerPK
    });

    return new PurchasableCertificate.Entity('0', deviceOwnerConfig).sync();
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

    const deviceOwnerConfig = changeUser(config, {
        address: deviceOwnerAddress,
        privateKey: deviceOwnerPK
    });

    const deviceOwnerAgreement = await new Agreement.Entity(agreement.id, deviceOwnerConfig).sync();
    await deviceOwnerAgreement.approveAgreementSupply();

    return deviceOwnerAgreement.sync();
};

export {
    deploy,
    changeUser,
    deployDemand,
    deployCertificate,
    deployDevice,
    deploySupply,
    deployAgreement
};
