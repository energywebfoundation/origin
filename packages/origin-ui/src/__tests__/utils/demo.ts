import Web3 from 'web3';
import ganache from 'ganache-cli';
import * as Winston from 'winston';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';
import { BACKEND_URL } from '../../utils/api';
import { MarketLogic } from '@energyweb/market';
import { IStoreState } from '../../types';
import axios from 'axios';
import { User, UserLogic, buildRights, Role } from '@energyweb/user-registry';
import { Compliance } from '@energyweb/utils-general';
import { CertificateLogic } from '@energyweb/origin';
import {
    ProducingAsset,
    AssetProducingRegistryLogic,
    AssetConsumingRegistryLogic
} from '@energyweb/asset-registry';

const connectionConfig = {
    web3: 'http://localhost:8545',
    deployKey: '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'
};

const adminPK = connectionConfig.deployKey;
const web3 = new Web3(connectionConfig.web3);

export const ACCOUNTS = {
    ADMIN: {
        address: web3.eth.accounts.privateKeyToAccount(adminPK).address,
        privateKey: adminPK
    },
    ASSET_MANAGER: {
        address: '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
        privateKey: '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac'
    },
    SMART_METER: {
        address: '0x6cc53915dbec95a66deb7c709c800cac40ee55f9',
        privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
    },
    TRADER: {
        address: '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
        privateKey: '0x50397ee7580b44c966c3975f561efb7b58a54febedaa68a5dc482e52fb696ae7',
        onChain: {
            id: '0x7672fa3f8c04abbcbad14d896aad8bedece72d2b',
            propertiesDocumentHash: null,
            url: null,
            active: true,
            roles: buildRights([Role.Trader]),
            organization: 'Trader organization'
        },
        offChain: {
            firstName: 'Trader',
            surname: '',
            email: 'trader@example.com',
            street: '',
            number: '',
            zip: '',
            city: '',
            country: '',
            state: '',
            notifications: false
        }
    }
};

export const deployDemo = async () => {
    const logger = Winston.createLogger({
        level: 'debug',
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const userContracts: any = await migrateUserRegistryContracts(web3, adminPK);
    const assetContracts: any = await migrateAssetRegistryContracts(
        web3,
        userContracts.UserContractLookup,
        adminPK
    );
    const originContracts: any = await migrateCertificateRegistryContracts(
        web3,
        assetContracts.AssetContractLookup,
        adminPK
    );
    const marketContracts: any = await migrateMarketRegistryContracts(
        web3,
        assetContracts.AssetContractLookup,
        originContracts.OriginContractLookup,
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

    await axios.put(`${BACKEND_URL}/MarketContractLookup`, {
        address: deployResult.marketContractLookup.toLowerCase()
    });

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

    const conf: IStoreState['configuration'] = {
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
            baseUrl: BACKEND_URL
        },
        logger
    };

    const adminPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: ACCOUNTS.ADMIN.address,
        active: true,
        roles: buildRights([Role.UserAdmin, Role.AssetAdmin]),
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
        notifications: false
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
        firstName: 'Asset',
        surname: 'Manager',
        email: 'assetmanager@example.com',
        street: '',
        number: '',
        zip: '',
        city: '',
        country: '',
        state: '',
        notifications: false
    };
    await User.createUser(assetManagerPropsOnChain, assetManagerPropsOffChain, conf);

    await User.createUser(ACCOUNTS.TRADER.onChain, ACCOUNTS.TRADER.offChain, conf);

    const assetProducingProps: ProducingAsset.IOnChainProperties = {
        smartMeter: { address: ACCOUNTS.SMART_METER.address },
        owner: { address: ACCOUNTS.ASSET_MANAGER.address },
        lastSmartMeterReadWh: 0,
        active: true,
        lastSmartMeterReadFileHash: '',
        propertiesDocumentHash: null,
        url: null,
        maxOwnerChanges: 1000
    };

    const assetProducingPropsOffChain: ProducingAsset.IOffChainProperties = {
        assetType: 'Wind;Onshore',
        complianceRegistry: Compliance.IREC,
        facilityName: 'Wuthering Heights Windfarm',
        capacityWh: 0,
        country: 'Thailand',
        address: '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        gpsLatitude: '',
        gpsLongitude: '',
        operationalSince: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: ''
    };

    try {
        await ProducingAsset.createAsset(assetProducingProps, assetProducingPropsOffChain, conf);
    } catch (error) {
        throw new Error(error);
    }

    return { conf, deployResult };
};

export const startGanache = async () => {
    return new Promise(resolve => {
        const ganacheServer = ganache.server({
            mnemonic: 'chalk park staff buzz chair purchase wise oak receive avoid avoid home',
            gasLimit: 8000000,
            default_balance_ether: 1000000,
            total_accounts: 20
        });

        ganacheServer.listen(8545, function(err, blockchain) {
            resolve({
                blockchain,
                ganacheServer
            });
        });

        resolve(ganacheServer);
    });
};
