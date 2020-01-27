import Web3 from 'web3';
import * as Winston from 'winston';

import {
    Device,
    DeviceLogic,
    ProducingDevice,
    Contracts as DeviceRegistryContracts
} from '@energyweb/device-registry';
import {
    MarketLogic,
    Demand,
    MarketUser,
    PurchasableCertificate,
    Contracts as MarketContracts
} from '@energyweb/market';
import { CertificateLogic, Contracts as OriginContracts } from '@energyweb/origin';
import {
    buildRights,
    Role,
    User,
    UserLogic,
    Contracts as UserRegistryContracts
} from '@energyweb/user-registry';

import { Configuration, TimeFrame, Unit } from '@energyweb/utils-general';
import moment from 'moment';
import {
    IOffChainDataClient,
    IConfigurationClient,
    IUserClient
} from '@energyweb/origin-backend-client';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export class Demo {
    public marketContractLookup: string;

    public marketLogic: MarketLogic;

    public certificateLogic: CertificateLogic;

    public deviceLogic: DeviceLogic;

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
            DEVICE_MANAGER: {
                address: '0x5b1b89a48c1fb9b6ef7fb77c453f2aaf4b156d45',
                privateKey: '0x622d56ab7f0e75ac133722cc065260a2792bf30ea3265415fe04f3a2dba7e1ac'
            },
            SMART_METER: {
                address: '0x6cc53915dbec95a66deb7c709c800cac40ee55f9',
                privateKey: '0x191c4b074672d9eda0ce576cfac79e44e320ffef5e3aadd55e000de57341d36c'
            },
            SMART_METER_2: {
                address: '0x4Db81bEfaF6B82553898739B788963d20Be8068a',
                privateKey: '0x968cc146af9c9d3ac08cca0dd3f915ed5a0966c118e26fd5e99066b0ff8bc060'
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

    async deploy(
        offChainDataClient: IOffChainDataClient,
        configurationClient: IConfigurationClient,
        userClient: IUserClient
    ) {
        this.userLogic = await UserRegistryContracts.migrateUserRegistryContracts(
            this.web3,
            this.adminPK
        );
        const userLogicAddress = this.userLogic.web3Contract.options.address;

        this.deviceLogic = await DeviceRegistryContracts.migrateDeviceRegistryContracts(
            this.web3,
            userLogicAddress,
            this.adminPK
        );
        const deviceLogicAddress = this.deviceLogic.web3Contract.options.address;

        this.certificateLogic = await OriginContracts.migrateCertificateRegistryContracts(
            this.web3,
            deviceLogicAddress,
            this.adminPK
        );
        const certificateLogicAddress = this.certificateLogic.web3Contract.options.address;

        this.marketLogic = await MarketContracts.migrateMarketRegistryContracts(
            this.web3,
            certificateLogicAddress,
            this.adminPK
        );

        const deployResult = {
            userLogic: '',
            deviceLogic: '',
            certificateLogic: '',
            marketLogic: ''
        };

        this.marketContractLookup = this.marketLogic.web3Contract.options.address;

        deployResult.userLogic = userLogicAddress;
        deployResult.deviceLogic = deviceLogicAddress;
        deployResult.certificateLogic = certificateLogicAddress;
        deployResult.marketLogic = this.marketContractLookup;

        this.conf = {
            blockchainProperties: {
                activeUser: {
                    address: this.ACCOUNTS.ADMIN.address,
                    privateKey: this.adminPK
                },
                deviceLogicInstance: this.deviceLogic,
                certificateLogicInstance: this.certificateLogic,
                userLogicInstance: this.userLogic,
                marketLogicInstance: this.marketLogic,
                web3: this.web3
            },
            offChainDataSource: {
                baseUrl: `${process.env.BACKEND_URL}/api`,
                client: offChainDataClient,
                configurationClient,
                userClient
            },
            logger: this.logger
        };

        const adminPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.ADMIN.address,
            active: true,
            roles: buildRights([Role.UserAdmin, Role.DeviceAdmin, Role.Issuer])
        };
        const adminPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: false
        };
        await MarketUser.createMarketUser(
            adminPropsOnChain,
            adminPropsOffChain,
            this.conf,
            {
                email: 'admin@example.com'
            },
            this.ACCOUNTS.ADMIN.privateKey
        );

        const deviceManagerPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.DEVICE_MANAGER.address,
            active: true,
            roles: buildRights([Role.DeviceAdmin, Role.DeviceManager, Role.Trader])
        };
        const deviceManagerPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: true,
            autoPublish: {
                enabled: true,
                priceInCents: 1000,
                currency: 'USD'
            }
        };
        await MarketUser.createMarketUser(
            deviceManagerPropsOnChain,
            deviceManagerPropsOffChain,
            this.conf,
            {
                email: 'devicemanager@example.com'
            },
            this.ACCOUNTS.DEVICE_MANAGER.privateKey
        );

        const listenerPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.LISTENER.address,
            active: true,
            roles: buildRights([Role.Listener])
        };
        const listenerPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: false
        };
        await MarketUser.createMarketUser(
            listenerPropsOnChain,
            listenerPropsOffChain,
            this.conf,
            {
                email: 'listener@example.com'
            },
            this.ACCOUNTS.LISTENER.privateKey
        );

        const matcherPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.MATCHER.address,
            active: true,
            roles: buildRights([Role.Matcher])
        };
        const matcherPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: false
        };
        await MarketUser.createMarketUser(
            matcherPropsOnChain,
            matcherPropsOffChain,
            this.conf,
            {
                email: 'matcher@example.com'
            },
            this.ACCOUNTS.MATCHER.privateKey
        );

        const marketLogicPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.conf.blockchainProperties.marketLogicInstance.web3Contract._address,
            active: true,
            roles: buildRights([Role.Matcher])
        };
        const marketLogicPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: false
        };

        await MarketUser.createMarketUser(
            marketLogicPropsOnChain,
            marketLogicPropsOffChain,
            this.conf,
            null,
            null,
            true
        );

        const traderOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: this.ACCOUNTS.TRADER.address,
            active: true,
            roles: buildRights([Role.Trader])
        };
        const traderOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: true
        };
        await MarketUser.createMarketUser(
            traderOnChain,
            traderOffChain,
            this.conf,
            {
                email: 'trader@example.com'
            },
            this.ACCOUNTS.TRADER.privateKey
        );

        const deviceProducingProps: Device.IOnChainProperties = {
            smartMeter: { address: this.ACCOUNTS.SMART_METER.address },
            owner: { address: this.ACCOUNTS.DEVICE_MANAGER.address },
            lastSmartMeterReadWh: 0,
            status: Device.DeviceStatus.Active,
            usageType: Device.UsageType.Producing,
            lastSmartMeterReadFileHash: '',
            propertiesDocumentHash: null,
            url: null
        };

        const deviceProducingPropsOffChain: ProducingDevice.IOffChainProperties = {
            deviceType: 'Wind',
            complianceRegistry: 'I-REC',
            facilityName: 'Wuthering Heights Windfarm',
            capacityInW: 0,
            country: 'Thailand',
            address:
                '95 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '',
            gpsLongitude: '',
            timezone: 'Asia/Bangkok',
            operationalSince: 0,
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            description: '',
            images: '',
            region: 'Central',
            province: 'Nakhon Pathom'
        };

        try {
            await ProducingDevice.createDevice(
                deviceProducingProps,
                deviceProducingPropsOffChain,
                this.conf
            );
        } catch (error) {
            throw new Error(error);
        }

        return { conf: this.conf, deployResult };
    }

    async deployNewDevice() {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.DEVICE_MANAGER;

        const deviceProducingProps: Device.IOnChainProperties = {
            smartMeter: { address: NULL_ADDRESS },
            owner: { address: this.ACCOUNTS.DEVICE_MANAGER.address },
            lastSmartMeterReadWh: 0,
            status: Device.DeviceStatus.Submitted,
            usageType: Device.UsageType.Producing,
            lastSmartMeterReadFileHash: '',
            propertiesDocumentHash: null,
            url: null
        };

        const deviceProducingPropsOffChain: ProducingDevice.IOffChainProperties = {
            deviceType: 'Wind',
            complianceRegistry: 'I-REC',
            facilityName: 'Test Device',
            capacityInW: 0,
            country: 'Thailand',
            address:
                '96 Moo 7, Sa Si Mum Sub-district, Kamphaeng Saen District, Nakhon Province 73140',
            gpsLatitude: '',
            gpsLongitude: '',
            timezone: 'Asia/Bangkok',
            operationalSince: 0,
            otherGreenAttributes: '',
            typeOfPublicSupport: '',
            description: '',
            images: '',
            region: 'Central',
            province: 'Nakhon Pathom'
        };

        let newDevice: ProducingDevice.Entity;

        try {
            newDevice = await ProducingDevice.createDevice(
                deviceProducingProps,
                deviceProducingPropsOffChain,
                this.conf
            );
        } catch (error) {
            throw new Error(error);
        }

        return newDevice.id;
    }

    async approveDevice(deviceId: string) {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.ADMIN;

        const device = await new ProducingDevice.Entity(deviceId, this.conf).sync();

        try {
            await device.setStatus(Device.DeviceStatus.Active);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDeviceStatus(deviceId: string) {
        const { status } = await new ProducingDevice.Entity(deviceId, this.conf).sync();

        return status;
    }

    async deploySmartMeterRead(smRead: number): Promise<void> {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.DEVICE_MANAGER;

        await this.deviceLogic.saveSmartMeterRead(
            0,
            smRead,
            'newSmartMeterRead',
            this.nextDeployedSmReadIndex,
            {
                privateKey: this.ACCOUNTS.SMART_METER.privateKey
            }
        );
        await this.certificateLogic.requestCertificates(0, this.nextDeployedSmReadIndex, {
            privateKey: this.ACCOUNTS.DEVICE_MANAGER.privateKey
        });
        await this.certificateLogic.approveCertificationRequest(this.nextDeployedSmReadIndex, {
            privateKey: this.adminPK
        });

        this.nextDeployedSmReadIndex += 1;
    }

    async publishForSale(certificateId: number) {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.DEVICE_MANAGER;

        const deployedCertificate = await new PurchasableCertificate.Entity(
            certificateId.toString(),
            this.conf
        ).sync();
        await deployedCertificate.publishForSale(1000, 'USD');
    }

    async deployDemand() {
        this.conf.blockchainProperties.activeUser = this.ACCOUNTS.TRADER;

        const demandOffChainProps: Demand.IDemandOffChainProperties = {
            timeFrame: TimeFrame.hourly,
            maxPriceInCentsPerMwh: 150000,
            currency: 'USD',
            location: ['Thailand;Central;Nakhon Pathom'],
            deviceType: ['Wind'],
            minCO2Offset: 10,
            otherGreenAttributes: 'string',
            typeOfPublicSupport: 'string',
            energyPerTimeFrame: 1 * Unit.MWh,
            registryCompliance: 'I-REC',
            startTime: moment().unix(),
            endTime: moment()
                .add(1, 'hour')
                .unix(),
            automaticMatching: true
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
