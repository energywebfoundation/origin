import { Device, ProducingDevice } from '@energyweb/device-registry';
import { Configuration, Countries } from '@energyweb/utils-general';
import { User } from '@energyweb/user-registry';
import { MarketUser } from '@energyweb/market';
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

    const currencies = await conf.offChainDataSource.configurationClient.get('Currency');
    const complianceRegistry = await conf.offChainDataSource.configurationClient.get('Compliance');

    if (action.type === 'CREATE_ACCOUNT') {
        const userPropsOnChain: User.IUserOnChainProperties = {
            propertiesDocumentHash: null,
            url: null,
            id: action.data.address,
            active: true,
            roles: action.data.rights
        };

        const userPropsOffChain: MarketUser.IMarketUserOffChainProperties = {
            notifications: action.data.notifications || false,
            autoPublish: action.data.autoPublish || {
                enabled: false,
                priceInCents: 150,
                currency: currencies[0]
            }
        };

        await MarketUser.createMarketUser(
            userPropsOnChain,
            userPropsOffChain,
            conf,
            {
                email: action.data.email,
                firstName: action.data.firstName,
                lastName: action.data.lastName,
                password: action.data.password,
                telephone: action.data.telephone,
                title: action.data.title
            },
            action.data.privateKey
        );

        conf.logger.info(
            `Onboarded a new user: ${action.data.address} (${action.data.email}) with rights ${action.data.rights}`
        );

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
        } else if (typeof action.data.organization?.id !== 'undefined') {
            await conf.offChainDataSource.userClient.login(
                action.data.organization.leadUser.email,
                action.data.organization.leadUser.password
            );
            await conf.offChainDataSource.organizationClient.invite(action.data.email);
            await conf.offChainDataSource.userClient.logout();

            await conf.offChainDataSource.userClient.login(action.data.email, action.data.password);
            await conf.offChainDataSource.organizationClient.acceptInvitation(action.data.organization.id);

            conf.logger.info(
                `Added user ${action.data.address} to organization with id ${action.data.organizationId}`
            );
            await conf.offChainDataSource.userClient.logout();
        }
    } else if (action.type === 'CREATE_ORGANIZATION') {
        await conf.offChainDataSource.userClient.login(action.data.leadUser.email, action.data.leadUser.password);

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
            complianceRegistry,
            otherGreenAttributes: action.data.otherGreenAttributes,
            typeOfPublicSupport: action.data.typeOfPublicSupport,
            facilityName: action.data.facilityName,
            description: '',
            images: '',
            region: action.data.region,
            province: action.data.province,
            smartMeterReads: action.data.smartMeterReads || []
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
