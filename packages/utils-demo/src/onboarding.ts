import { ConsumingAsset, Asset, ProducingAsset } from '@energyweb/asset-registry';
import { Configuration, Compliance } from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';

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

            const userPropsOffChain: User.IUserOffChainProperties = {
                firstName: action.data.firstName,
                surname: action.data.surname,
                email: action.data.email,
                street: action.data.street,
                number: action.data.number,
                zip: action.data.zip,
                city: action.data.city,
                country: action.data.country,
                state: action.data.state,
                notifications: true
            };

            await User.createUser(userPropsOnChain, userPropsOffChain, conf);

            conf.logger.info('Onboarded a new user: ' + action.data.address);
            conf.logger.verbose(
                'User Properties: ' + action.data.organization + ', ' + action.data.rights
            );

            break;

        case 'CREATE_PRODUCING_ASSET':
            console.log('-----------------------------------------------------------');

            const assetProducingProps: Asset.IOnChainProperties = {
                smartMeter: { address: action.data.smartMeter },
                owner: { address: action.data.owner },
                lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
                active: action.data.active,
                lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
                propertiesDocumentHash: null,
                url: null
            };

            const assetTypeConfig = action.data.assetType;
            const assetCompliance = Compliance[action.data.complianceRegistry as keyof typeof Compliance];

            const assetProducingPropsOffChain: ProducingAsset.IOffChainProperties = {
                operationalSince: action.data.operationalSince,
                capacityWh: action.data.capacityWh,
                country: action.data.country,
                address: action.data.address,
                gpsLatitude: action.data.gpsLatitude,
                gpsLongitude: action.data.gpsLongitude,
                timezone: action.data.timezone,
                assetType: assetTypeConfig,
                complianceRegistry: assetCompliance,
                otherGreenAttributes: action.data.otherGreenAttributes,
                typeOfPublicSupport: action.data.typeOfPublicSupport,
                facilityName: action.data.facilityName
            };

            try {
                await ProducingAsset.createAsset(
                    assetProducingProps,
                    assetProducingPropsOffChain,
                    conf
                );
            } catch (e) {
                conf.logger.error('ERROR: ' + e);
            }

            console.log('-----------------------------------------------------------\n');

            break;
        case 'CREATE_CONSUMING_ASSET':
            console.log('-----------------------------------------------------------');

            const assetConsumingProps: Asset.IOnChainProperties = {
                smartMeter: { address: action.data.smartMeter },
                owner: { address: action.data.owner },
                lastSmartMeterReadWh: action.data.lastSmartMeterReadWh,
                active: action.data.active,
                lastSmartMeterReadFileHash: action.data.lastSmartMeterReadFileHash,
                propertiesDocumentHash: null,
                url: null
            };

            const assetConsumingPropsOffChain: Asset.IOffChainProperties = {
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
                await ConsumingAsset.createAsset(
                    assetConsumingProps,
                    assetConsumingPropsOffChain,
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
