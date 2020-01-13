import { ConsumingDevice, Device, ProducingDevice } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';
import { MarketUser } from '@energyweb/market';
import { ConfigurationClient } from '@energyweb/origin-backend-client';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deviceStatusFactory(status: string) {
    if (!(status in Device.DeviceStatus)) {
        throw new Error(`Device status can't be: ${status}.`);
    }

    return Device.DeviceStatus[status as keyof typeof Device.DeviceStatus];
}

export const onboardDemo = async (
    actionString: string,
    conf: Configuration.Entity,
    adminPrivateKey: string
) => {
    const action = JSON.parse(actionString);

    const adminPK = adminPrivateKey.startsWith('0x') ? adminPrivateKey : `0x${adminPrivateKey}`;

    const adminAccount = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(adminPK);

    const client = new ConfigurationClient();
    const currencies = await client.get(conf.offChainDataSource.baseUrl, 'Currency');
    const complianceRegistry = await client.get(conf.offChainDataSource.baseUrl, 'Compliance');

    if (action.type === 'CREATE_ACCOUNT') {
        const userPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: action.data.address,
            active: true,
            roles: action.data.rights,
            organization: action.data.organization
        };

        const userPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            firstName: action.data.firstName,
            surname: action.data.surname,
            email: action.data.email,
            street: action.data.street,
            number: action.data.number,
            zip: action.data.zip,
            city: action.data.city,
            country: action.data.country,
            state: action.data.state,
            notifications: action.data.notifications || false,
            autoPublish: action.data.autoPublish || {
                enabled: false,
                price: 1.5,
                currency: currencies[0]
            }
        };

        await MarketUser.createMarketUser(userPropsOnChain, userPropsOffChain, conf);

        conf.logger.info(`Onboarded a new user: ${action.data.address}`);
        conf.logger.verbose(`User Properties: ${action.data.organization}, ${action.data.rights}`);
    } else if (action.type === 'CREATE_PRODUCING_DEVICE') {
        console.log('-----------------------------------------------------------');

        const deviceProducingProps: Device.IOnChainProperties = {
            smartMeter: { address: action.data.smartMeter },
            owner: { address: action.data.owner },
            lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
            status: deviceStatusFactory(action.data.status),
            usageType: Device.UsageType.Producing,
            lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
            propertiesDocumentHash: null,
            url: null
        };

        const deviceTypeConfig = action.data.deviceType;

        const deviceProducingPropsOffChain: ProducingDevice.IOffChainProperties = {
            operationalSince: action.data.operationalSince,
            capacityInW: action.data.capacityInW,
            country: action.data.country,
            address: action.data.address,
            gpsLatitude: action.data.gpsLatitude,
            gpsLongitude: action.data.gpsLongitude,
            timezone: action.data.timezone,
            deviceType: deviceTypeConfig,
            complianceRegistry,
            otherGreenAttributes: action.data.otherGreenAttributes,
            typeOfPublicSupport: action.data.typeOfPublicSupport,
            facilityName: action.data.facilityName,
            description: '',
            images: '',
            region: action.data.region,
            province: action.data.province
        };

        try {
            await ProducingDevice.createDevice(
                deviceProducingProps,
                deviceProducingPropsOffChain,
                conf
            );
        } catch (e) {
            conf.logger.error(`ERROR: ${e}`);
        }

        console.log('-----------------------------------------------------------\n');
    } else if (action.type === 'CREATE_CONSUMING_DEVICE') {
        console.log('-----------------------------------------------------------');

        const deviceConsumingProps: Device.IOnChainProperties = {
            smartMeter: { address: action.data.smartMeter },
            owner: { address: action.data.owner },
            lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
            status: deviceStatusFactory(action.data.status),
            usageType: Device.UsageType.Consuming,
            lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
            propertiesDocumentHash: null,
            url: null
        };

        const deviceConsumingPropsOffChain: Device.IOffChainProperties = {
            capacityInW: action.data.capacityInW,
            country: action.data.country,
            address: action.data.address,
            gpsLatitude: action.data.gpsLatitude,
            gpsLongitude: action.data.gpsLongitude,
            timezone: action.data.timezone,
            operationalSince: action.data.operationalSince,
            facilityName: action.data.facilityName,
            description: '',
            images: '',
            region: action.data.region,
            province: action.data.province
        };

        try {
            await ConsumingDevice.createDevice(
                deviceConsumingProps,
                deviceConsumingPropsOffChain,
                conf
            );
        } catch (e) {
            conf.logger.error(e);
        }

        console.log('-----------------------------------------------------------\n');
    } else if (action.type === 'SLEEP') {
        console.log('sleep');
        await sleep(action.data);
    } else {
        conf.logger.warn(`Unidentified Command: ${action.type}`);
    }
};
