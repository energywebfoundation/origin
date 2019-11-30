import { ConsumingDevice, Device, ProducingDevice } from '@energyweb/asset-registry';
import { Configuration, Compliance, Currency } from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';
import { MarketUser } from '@energyweb/market';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const onboardDemo = async (
    actionString: string,
    conf: Configuration.Entity,
    adminPrivateKey: string
) => {
    const action = JSON.parse(actionString);

    const adminPK = adminPrivateKey.startsWith('0x') ? adminPrivateKey : '0x' + adminPrivateKey;

    const adminAccount = conf.blockchainProperties.web3.eth.accounts.privateKeyToAccount(adminPK);

    switch (action.type) {
        case 'CREATE_ACCOUNT':
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
                    currency: Currency.USD
                }
            };

            await MarketUser.createMarketUser(userPropsOnChain, userPropsOffChain, conf);

            conf.logger.info('Onboarded a new user: ' + action.data.address);
            conf.logger.verbose(
                'User Properties: ' + action.data.organization + ', ' + action.data.rights
            );

            break;

        case 'CREATE_PRODUCING_ASSET':
            console.log('-----------------------------------------------------------');

            const deviceProducingProps: Device.IOnChainProperties = {
                smartMeter: { address: action.data.smartMeter },
                owner: { address: action.data.owner },
                lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
                active: action.data.active,
                usageType: Device.UsageType.Producing,
                lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
                propertiesDocumentHash: null,
                url: null
            };

            const deviceTypeConfig = action.data.deviceType;
            const deviceCompliance = Compliance[action.data.complianceRegistry as keyof typeof Compliance];

            const deviceProducingPropsOffChain: ProducingDevice.IOffChainProperties = {
                operationalSince: action.data.operationalSince,
                capacityWh: action.data.capacityWh,
                country: action.data.country,
                address: action.data.address,
                gpsLatitude: action.data.gpsLatitude,
                gpsLongitude: action.data.gpsLongitude,
                timezone: action.data.timezone,
                deviceType: deviceTypeConfig,
                complianceRegistry: deviceCompliance,
                otherGreenAttributes: action.data.otherGreenAttributes,
                typeOfPublicSupport: action.data.typeOfPublicSupport,
                facilityName: action.data.facilityName
            };

            try {
                await ProducingDevice.createDevice(
                    deviceProducingProps,
                    deviceProducingPropsOffChain,
                    conf
                );
            } catch (e) {
                conf.logger.error('ERROR: ' + e);
            }

            console.log('-----------------------------------------------------------\n');

            break;
        case 'CREATE_CONSUMING_ASSET':
            console.log('-----------------------------------------------------------');

            const deviceConsumingProps: Device.IOnChainProperties = {
                smartMeter: { address: action.data.smartMeter },
                owner: { address: action.data.owner },
                lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
                active: action.data.active,
                usageType: Device.UsageType.Consuming,
                lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
                propertiesDocumentHash: null,
                url: null
            };

            const deviceConsumingPropsOffChain: Device.IOffChainProperties = {
                capacityWh: action.data.capacityWh,
                country: action.data.country,
                address: action.data.address,
                gpsLatitude: action.data.gpsLatitude,
                gpsLongitude: action.data.gpsLongitude,
                timezone: action.data.timezone,
                operationalSince: action.data.operationalSince,
                facilityName: action.data.facilityName
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
            break;

        case 'SLEEP':
            console.log('sleep');
            await sleep(action.data);
            break;

        default:
            conf.logger.warn('Unidentified Command: ' + action.type);
    }
};
