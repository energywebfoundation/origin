import { Device, ProducingDevice } from '@energyweb/device-registry';
import { Configuration } from '@energyweb/utils-general';
import { IDevice, DeviceStatus } from '@energyweb/origin-backend-core';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function deviceStatusFactory(status: string) {
    if (!(status in DeviceStatus)) {
        throw new Error(`Device status can't be: ${status}.`);
    }

    return DeviceStatus[status as keyof typeof DeviceStatus];
}

export const onboardDemo = async (actionString: string, conf: Configuration.Entity) => {
    const action = JSON.parse(actionString);

    const {
        currencies,
        complianceStandard
    } = await conf.offChainDataSource.configurationClient.get();

    if (action.type === 'CREATE_ACCOUNT') {
        // TODO: create new onboarding for users
    } else if (action.type === 'CREATE_ORGANIZATION') {
        await conf.offChainDataSource.userClient.login(
            action.data.leadUser.email,
            action.data.leadUser.password
        );

        await conf.offChainDataSource.organizationClient.add({
            address: action.data.address,
            ceoName: action.data.ceoName,
            telephone: action.data.telephone,
            ceoPassportNumber: action.data.ceoPassportNumber,
            code: action.data.code,
            numberOfEmployees: action.data.numberOfEmployees,
            postcode: action.data.postcode,
            shareholders: action.data.shareholders,
            name: action.data.name,
            contact: action.data.contact,
            email: action.data.email,
            vatNumber: action.data.vatNumber,
            website: action.data.website,
            yearOfRegistration: action.data.yearOfRegistration,
            headquartersCountry: 83,
            companyNumber: '',
            country: 83,
            businessTypeSelect: 'Private individual',
            businessTypeInput: '',
            activeCountries: '[83]'
        });

        conf.logger.info(`Onboarded a new organization: ${action.data.name}`);

        await conf.offChainDataSource.userClient.logout();
    } else if (action.type === 'CREATE_PRODUCING_DEVICE') {
        console.log('-----------------------------------------------------------');

        const deviceProducingProps: Device.IOnChainProperties = {
            smartMeter: { address: action.data.smartMeter },
            owner: { address: action.data.owner }
        };

        const deviceTypeConfig = action.data.deviceType;

        const deviceProducingPropsOffChain: IDevice = {
            status: deviceStatusFactory(action.data.status),
            operationalSince: Number(action.data.operationalSince),
            capacityInW: action.data.capacityInW,
            country: action.data.country,
            address: action.data.address,
            gpsLatitude: action.data.gpsLatitude,
            gpsLongitude: action.data.gpsLongitude,
            timezone: action.data.timezone,
            deviceType: deviceTypeConfig,
            complianceRegistry: complianceStandard,
            otherGreenAttributes: action.data.otherGreenAttributes,
            typeOfPublicSupport: action.data.typeOfPublicSupport,
            facilityName: action.data.facilityName,
            description: '',
            images: '',
            region: action.data.region,
            province: action.data.province,
            smartMeterReads: action.data.smartMeterReads || [],
            externalDeviceIds: action.data.externalDeviceIds
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
    } else if (action.type === 'SLEEP') {
        console.log('sleep');
        await sleep(action.data);
    } else {
        conf.logger.warn(`Unidentified Command: ${action.type}`);
    }
};
