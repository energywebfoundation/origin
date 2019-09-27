import * as React from 'react';
import { mount } from 'enzyme';
import { AppContainer } from '../components/AppContainer';
import { Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { createRootReducer } from '../reducers';
import { User, UserLogic, buildRights, Role } from '@energyweb/user-registry';
import { migrateUserRegistryContracts } from '@energyweb/user-registry/contracts';
import {
    ProducingAsset,
    AssetProducingRegistryLogic,
    AssetConsumingRegistryLogic
} from '@energyweb/asset-registry';
import { migrateAssetRegistryContracts } from '@energyweb/asset-registry/contracts';
import createSagaMiddleware from 'redux-saga';
import sagas from '../features/sagas';

import { startAPI } from '@energyweb/utils-testbackend/dist/js/src/api';

import Web3 from 'web3';

import { CertificateLogic } from '@energyweb/origin';
import { migrateCertificateRegistryContracts } from '@energyweb/origin/contracts';
import { MarketLogic } from '@energyweb/market';
import { migrateMarketRegistryContracts } from '@energyweb/market/contracts';
import { Compliance } from '@energyweb/utils-general';
import * as Winston from 'winston';
import ganache from 'ganache-cli';
import axios from 'axios';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { IStoreState } from '../types';

const wait = (ms: number) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};
const API_PORT = 3036;
const API_BASE_URL = `http://localhost:${API_PORT}`;

jest.setTimeout(80000);

let ganacheServer;
let apiServer;

const startGanache = async () => {
    return new Promise(resolve => {
        ganacheServer = ganache.server({
            mnemonic: 'chalk park staff buzz chair purchase wise oak receive avoid avoid home',
            gasLimit: 8000000,
            default_balance_ether: 1000000,
            total_accounts: 20
        });

        ganacheServer.listen(8550, function(err, blockchain) {
            resolve({
                blockchain,
                ganacheServer
            });
        });
    });
};

const deployDemo = async () => {
    const connectionConfig = {
        web3: 'http://localhost:8550',
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
            privateKey: '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac'
        },
        SMART_METER: {
            address: '0x6cc53915dbec95a66deb7c709c800cac40ee55f9',
            privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
        }
    };

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

    await axios.put(
        `${API_BASE_URL}/OriginContractLookupMarketLookupMapping/${deployResult.originContractLookup.toLowerCase()}`,
        {
            marketContractLookup: deployResult.marketContractLookup.toLowerCase()
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
            baseUrl: API_BASE_URL
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
        assetType: 'Wind',
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

describe('Application[E2E]', () => {
    let CONTRACT;

    beforeAll(async () => {
        apiServer = await startAPI(API_PORT);
        await startGanache();
        const { deployResult } = await deployDemo();

        CONTRACT = deployResult.originContractLookup;
    });

    it('correctly navigates to producing asset details', async () => {
        const sagaMiddleware = createSagaMiddleware();

        const history = createMemoryHistory({
            initialEntries: [`/${CONTRACT}/assets/?rpc=http://localhost:8545`]
        });

        const middleware = applyMiddleware(routerMiddleware(history), sagaMiddleware);

        const store = createStore(createRootReducer(history), middleware);

        Object.keys(sagas).forEach((saga: keyof typeof sagas) => {
            sagaMiddleware.run(sagas[saga]);
        });

        const renderedApp = mount(
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Route path="/:contractAddress/" component={AppContainer} />
                </ConnectedRouter>
            </Provider>
        );

        await wait(10000);

        renderedApp.update();

        expect(renderedApp.find('.ViewProfile').text()).toBe('admin');

        expect(renderedApp.find('table tbody tr td').map(el => el.text())).toEqual([
            'Asset Manager organization',
            'Wuthering Heights Windfarm',
            '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140, Thailand',
            'Wind',
            '0',
            '0'
        ]);

        expect(renderedApp.find('span.MuiTablePagination-caption').text()).toBe('1-1 of 1');

        // Go to asset details
        renderedApp
            .find('table tbody tr td')
            .first()
            .simulate('click');

        renderedApp.update();

        expect(renderedApp.find('table tbody tr td div').map(el => el.text())).toEqual([
            'Facility Name',
            'Wuthering Heights Windfarm ',
            'Asset Owner',
            ' ',
            'Certified by Registry (private)',
            'IREC ',
            'Other Green Attributes (private)',
            ' ',
            'Asset Type',
            'Wind ',
            '',
            'Meter Read',
            '0 kWh',
            'Public Support (private)',
            ' ',
            'Commissioning Date (private)',
            'Jan 70 ',
            'Nameplate Capacity (private)',
            '0 kW',
            'Geo Location (private)',
            ',  ',
            '',
            ''
        ]);

        renderedApp.unmount();

        await ganacheServer.close();

        apiServer.close();
    });
});
