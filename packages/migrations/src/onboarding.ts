import { ProducingDevice } from '@energyweb/device-registry';
import { Configuration, signTypedMessage } from '@energyweb/utils-general';
import { DeviceStatus } from '@energyweb/origin-backend-core';

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
        offChainDataSource: { userClient, configurationClient },
        blockchainProperties: { web3 }
    } = conf;

    const { currencies, complianceStandard } = await configurationClient.get();

    if (action.type === 'CREATE_USER') {
        const user = await userClient.register({
            email: action.data.email,
            firstName: action.data.firstName,
            lastName: action.data.lastName,
            password: action.data.password,
            telephone: action.data.telephone,
            title: action.data.title,
            notifications: action.data.notifications || false,
            autoPublish: action.data.autoPublish || {
                enabled: false,
                priceInCents: 150,
                currency: currencies[0]
            },
            rights: action.data.rights
        });

        conf.logger.info(`Onboarded a new user: ${action.data.email}`);

        if (action.data.address && action.data.privateKey) {
            const REGISTRATION_MESSAGE_TO_SIGN =
                process.env.REGISTRATION_MESSAGE_TO_SIGN ?? 'I register as Origin user';

            const signedMessage = await signTypedMessage(
                action.data.address,
                REGISTRATION_MESSAGE_TO_SIGN,
                web3,
                action.data.privateKey
            );

            await userClient.attachSignedMessage(user.id, signedMessage);

            conf.logger.info(
                `Attached blockchain account: ${action.data.address} to user: ${action.data.email}`
            );
        }

        if (typeof action.data.organization === 'string') {
            await conf.offChainDataSource.userClient.login(action.data.email, action.data.password);

            await conf.offChainDataSource.organizationClient.add({
                address: 'Address',
                ceoName: 'Ceo name',
                telephone: '1',
                ceoPassportNumber: '1',
                code: '1',
                numberOfEmployees: 1,
                postcode: '1',
                shareholders: '1',
                name: action.data.organization,
                contact: 'Contact',
                email: action.data.email,
                vatNumber: 'XY123456',
                website: 'http://example.com',
                yearOfRegistration: 2020,
                headquartersCountry: 83,
                companyNumber: '',
                country: 83,
                businessTypeSelect: 'Private individual',
                businessTypeInput: '',
                activeCountries: '[83]'
            });
            conf.logger.info(
                `Created organization ${action.data.organization} by the user ${action.data.email}`
            );
            await conf.offChainDataSource.userClient.logout();
        } else if (typeof action.data.organization?.id !== 'undefined') {
            await conf.offChainDataSource.userClient.login(
                action.data.organization.leadUser.email,
                action.data.organization.leadUser.password
            );
            await conf.offChainDataSource.organizationClient.invite(action.data.email);
            await conf.offChainDataSource.userClient.logout();

            await conf.offChainDataSource.userClient.login(action.data.email, action.data.password);
            await conf.offChainDataSource.organizationClient.acceptInvitation(
                action.data.organization.id
            );

            conf.logger.info(
                `Added user ${action.data.address} to organization with id ${action.data.organizationId}`
            );
            await conf.offChainDataSource.userClient.logout();
        }
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

        await conf.offChainDataSource.userClient.login(
            action.data.user.email,
            action.data.user.password
        );

        const deviceTypeConfig = action.data.deviceType;

        const data = {
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
            await ProducingDevice.createDevice(data, conf);
        } catch (error) {
            if (error?.response?.data) {
                conf.logger.error('HTTP Error', {
                    config: error.config,
                    response: error?.response?.data
                });
            } else {
                conf.logger.error(`ERROR: ${error}`);
            }
        }

        await conf.offChainDataSource.userClient.logout();

        console.log('-----------------------------------------------------------\n');
    } else if (action.type === 'SLEEP') {
        console.log('sleep');
        await sleep(action.data);
    } else {
        conf.logger.warn(`Undefined command: ${action.type}`);
    }
};
