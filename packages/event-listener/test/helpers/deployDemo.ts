import axios from 'axios';
import Web3 from 'web3';
import * as Winston from 'winston';

import { AssetConsumingRegistryLogic, AssetProducingRegistryLogic, migrateAssetRegistryContracts, ProducingAsset } from '@energyweb/asset-registry';
import { MarketLogic, migrateMarketRegistryContracts } from '@energyweb/market';
import { CertificateLogic, migrateCertificateRegistryContracts } from '@energyweb/origin';
import { buildRights, migrateUserRegistryContracts, Role, User, UserLogic } from '@energyweb/user-registry';
import { Configuration } from '@energyweb/utils-general';

export const deployDemo = async () => {
    const connectionConfig = {
        web3: 'http://localhost:8545',
        deployKey: '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'
    };

    const adminPK = connectionConfig.deployKey;
    const web3 = new Web3(connectionConfig.web3);

    const ACCOUNTS = {
        ADMIN: {
            address: web3.eth.accounts.privateKeyToAccount(adminPK).address,
            privateKey: adminPK
        },
        ASSET_MANAGER: {
            address: '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
            privateKey: '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac',
        },
        SMART_METER: {
            address: '0x6cc53915dbec95a66deb7c709c800cac40ee55f9',
            privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
        }
    }

    const logger = Winston.createLogger({
        level: 'debug',
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const userContracts: any = await migrateUserRegistryContracts(web3, adminPK);
    const assetContracts: any = await migrateAssetRegistryContracts(web3, userContracts.UserContractLookup, adminPK);
    const originContracts: any = await migrateCertificateRegistryContracts(
        web3,
        assetContracts.AssetContractLookup,
        adminPK
        );
    const marketContracts: any = await migrateMarketRegistryContracts(
        web3,
        assetContracts.AssetContractLookup,
        adminPK
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
        `${process.env.API_BASE_URL}/OriginContractLookupMarketLookupMapping/${deployResult.originContractLookup.toLowerCase()}`,
        {
            marketContractLookup: deployResult.marketContractLookup.toLowerCase(),
        }
    );

    const userLogic = new UserLogic(web3, deployResult.userLogic);
    const assetProducingRegistryLogic = new AssetProducingRegistryLogic(
        web3,
        deployResult.assetProducingRegistryLogic
    );
    const assetConsumingRegistryLogic = new AssetConsumingRegistryLogic(
        web3,
        deployResult.assetConsumingRegistryLogic
    );
    const certificateLogic = new CertificateLogic(web3, deployResult.certificateLogic);
    const marketLogic = new MarketLogic(web3, deployResult.marketLogic);

    const conf: Configuration.Entity = {
        blockchainProperties: {
            activeUser: {
                address: ACCOUNTS.ADMIN.address,
                privateKey: adminPK
            },
            producingAssetLogicInstance: assetProducingRegistryLogic,
            consumingAssetLogicInstance: assetConsumingRegistryLogic,
            certificateLogicInstance: certificateLogic,
            userLogicInstance: userLogic,
            marketLogicInstance: marketLogic,
            web3
        },
        offChainDataSource: {
            baseUrl: process.env.API_BASE_URL
        },
        logger
    };

    const adminPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: ACCOUNTS.ADMIN.address,
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
        state: ''
    };
    await User.createUser(adminPropsOnChain, adminPropsOffChain, conf);

    const assetManagerPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: ACCOUNTS.ASSET_MANAGER.address,
        active: true,
        roles: buildRights([Role.AssetManager]),
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
        state: ''
    };
    await User.createUser(assetManagerPropsOnChain, assetManagerPropsOffChain, conf);

    const assetProducingProps: ProducingAsset.IOnChainProperties = {
        smartMeter: { address: ACCOUNTS.SMART_METER.address },
        owner: { address: ACCOUNTS.ASSET_MANAGER.address },
        lastSmartMeterReadWh: 0,
        active: true,
        lastSmartMeterReadFileHash: '',
        propertiesDocumentHash: null,
        url: null,
        maxOwnerChanges: 1000,
        matcher: []
    };

    const assetProducingPropsOffChain: ProducingAsset.IOffChainProperties = {
        assetType: ProducingAsset.Type.Wind,
        complianceRegistry: ProducingAsset.Compliance.IREC,
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
            conf
        );
    } catch (error) {
        throw new Error(error);
    }

    await assetProducingRegistryLogic.saveSmartMeterRead(0, 1e7, 'newSmartMeterRead', 0,
        { privateKey: ACCOUNTS.SMART_METER.privateKey }
    );
    await certificateLogic.requestCertificates(0, 0, { privateKey: ACCOUNTS.ASSET_MANAGER.privateKey });
    await certificateLogic.approveCertificationRequest(0, { privateKey: adminPK });

    return { conf, deployResult };
};
