import Web3 from 'web3';
// eslint-disable-next-line import/no-extraneous-dependencies
import ganache from 'ganache-cli';
import * as Winston from 'winston';

import {
    Contracts as UserRegistryContracts,
    User,
    buildRights,
    Role
} from '@energyweb/user-registry';
import {
    Contracts as DeviceRegistryContracts,
    Device,
    ProducingDevice
} from '@energyweb/device-registry';
import { Contracts as IssuerContracts } from '@energyweb/issuer';
import { MarketUser } from '@energyweb/market';
import {
    DeviceStatus,
    OrganizationPostData,
    IUserWithRelationsIds,
    IDevice,
    IContractsLookup
} from '@energyweb/origin-backend-core';
import { OffChainDataSourceMock } from '@energyweb/origin-backend-client-mocks';

import { IStoreState } from '../../types';

import { TEST_DEVICE_TYPES } from './helpers';
import { DeviceTypeService } from '@energyweb/utils-general';

const connectionConfig = {
    web3: 'http://localhost:8545',
    deployKey: '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'
};

const adminPK = connectionConfig.deployKey;
const web3 = new Web3(connectionConfig.web3);

function createTestRegisterData(email: string, firstName?: string, lastName?: string) {
    return {
        email,
        firstName: firstName ?? 'John',
        lastName: lastName ?? 'Doe',
        password: 'test',
        telephone: '111-111-111',
        title: 'Mr'
    };
}

export const ACCOUNTS = {
    ADMIN: {
        address: web3.eth.accounts.privateKeyToAccount(adminPK).address,
        privateKey: adminPK
    },
    DEVICE_MANAGER: {
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
            roles: buildRights([Role.Trader])
        },
        offChain: {
            notifications: false
        }
    }
};

export async function deployDemo() {
    const logger = Winston.createLogger({
        level: 'verbose',
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
        transports: [new Winston.transports.Console({ level: 'silly' })]
    });

    const userLogic = await UserRegistryContracts.migrateUserRegistryContracts(web3, adminPK);
    const userLogicAddress = userLogic.web3Contract.options.address;

    const deviceLogic = await DeviceRegistryContracts.migrateDeviceRegistryContracts(
        web3,
        userLogicAddress,
        adminPK
    );
    const deviceLogicAddress = deviceLogic.web3Contract.options.address;

    const registry = await IssuerContracts.migrateRegistry(web3, adminPK);
    const registryAddress = registry.web3Contract.options.address;

    const issuer = await IssuerContracts.migrateIssuer(web3, deviceLogicAddress, adminPK);
    const issuerAddress = issuer.web3Contract.options.address;

    const deployResult: IContractsLookup = {
        userLogic: userLogicAddress,
        deviceLogic: deviceLogicAddress,
        registry: registryAddress,
        issuer: issuerAddress
    };

    const offChainDataSource = new OffChainDataSourceMock();

    await offChainDataSource.configurationClient.add('device-types', TEST_DEVICE_TYPES);
    await offChainDataSource.configurationClient.add('ContractsLookup', deployResult);
    await offChainDataSource.configurationClient.add('Currency', 'USD');
    await offChainDataSource.configurationClient.add('Country', {
        name: 'Thailand',
        regions: { Central: ['Nakhon Pathom'] }
    });

    const conf: IStoreState['configuration'] = {
        blockchainProperties: {
            activeUser: {
                address: ACCOUNTS.ADMIN.address,
                privateKey: adminPK
            },
            userLogicInstance: userLogic,
            deviceLogicInstance: deviceLogic,
            registry,
            issuer,
            web3
        },
        offChainDataSource,
        logger,
        deviceTypeService: new DeviceTypeService(
            await offChainDataSource.configurationClient.get('device-types')
        )
    };

    function createOrganization(user: IUserWithRelationsIds, name: string) {
        const newOrganization = (offChainDataSource.organizationClient as any).addMocked(
            ({ name } as Partial<OrganizationPostData>) as OrganizationPostData,
            user.id
        );

        (offChainDataSource.userClient as any).updateMocked(user.id, {
            ...user,
            organization: newOrganization.id
        });
    }

    const adminPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: ACCOUNTS.ADMIN.address,
        active: true,
        roles: buildRights([Role.UserAdmin, Role.DeviceAdmin])
    };
    const adminPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
        notifications: false
    };
    await MarketUser.createMarketUser(
        adminPropsOnChain,
        adminPropsOffChain,
        conf,
        createTestRegisterData('admin@example.com'),
        ACCOUNTS.ADMIN.privateKey
    );

    const deviceManagerPropsOnChain: User.IUserOnChainProperties = {
        propertiesDocumentHash: null,
        url: null,
        id: ACCOUNTS.DEVICE_MANAGER.address,
        active: true,
        roles: buildRights([Role.DeviceManager])
    };
    const deviceManagerPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
        notifications: false
    };
    const deviceManager = await MarketUser.createMarketUser(
        deviceManagerPropsOnChain,
        deviceManagerPropsOffChain,
        conf,
        createTestRegisterData('devicemanager@example.com'),
        ACCOUNTS.DEVICE_MANAGER.privateKey
    );

    createOrganization(deviceManager.information, 'Device Manager organization');

    const trader = await MarketUser.createMarketUser(
        ACCOUNTS.TRADER.onChain,
        ACCOUNTS.TRADER.offChain,
        conf,
        createTestRegisterData('trader@example.com', 'Trader_Forename', 'Trader_Surname'),
        ACCOUNTS.TRADER.privateKey
    );

    createOrganization(trader.information, 'Trader organization');

    const deviceProducingProps: Device.IOnChainProperties = {
        smartMeter: { address: ACCOUNTS.SMART_METER.address },
        owner: { address: ACCOUNTS.DEVICE_MANAGER.address }
    };

    const deviceProducingPropsOffChain: IDevice = {
        status: DeviceStatus.Active,
        deviceType: 'Wind;Onshore',
        complianceRegistry: 'I-REC',
        facilityName: 'Wuthering Heights Windfarm',
        capacityInW: 0,
        country: 'Thailand',
        address: '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
        gpsLatitude: '',
        gpsLongitude: '',
        timezone: 'Asia/Bangkok',
        operationalSince: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        description: '',
        images: '',
        region: 'Central',
        province: 'Nakhon Pathom',
        smartMeterReads: []
    };

    try {
        await ProducingDevice.createDevice(
            deviceProducingProps,
            deviceProducingPropsOffChain,
            conf
        );
    } catch (error) {
        throw new Error(error);
    }

    return {
        conf,
        deployResult
    };
}

interface IGanacheServer {
    close(): Promise<void>;
    listen(port: number, callback: () => void): void;
}

export async function startGanache(): Promise<IGanacheServer> {
    const ganacheServer = ganache.server({
        mnemonic: 'chalk park staff buzz chair purchase wise oak receive avoid avoid home',
        gasLimit: 8000000,
        default_balance_ether: 1000000,
        total_accounts: 20
    }) as IGanacheServer;

    ganacheServer.listen(8545, () => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    return ganacheServer;
}
