import * as testUser from '../fixtures/testUser.json';
import * as testOrg from '../fixtures/testOrganization.json';
import * as testDevice from '../fixtures/testDevice.json';

export const generateNewUser = (): UserRegisterData => {
    const randomNumber = Math.round(Math.random() * 100000);

    return {
        ...testUser,
        firstName: `${randomNumber}${testUser.firstName}`,
        email: `${randomNumber}${testUser.email}`
    };
};

export const generateNewOrg = (user: UserRegisterData): OrganizationPostData => {
    const userNumber = user.firstName.match(/\d/g).join('');

    return {
        ...testOrg,
        name: `${testOrg.name} ${userNumber}`,
        address: `${testOrg.address} ${userNumber}`,
        zipCode: `${testOrg.zipCode}${userNumber}`
    };
};

export const generateNewDevice = (user: UserRegisterData): DevicePostData => {
    return {
        ...testDevice,
        facilityName: `${user.firstName}-facility`
    };
};
