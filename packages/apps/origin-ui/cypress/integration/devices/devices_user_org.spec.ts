import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Devices for registered user', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/');
    });

    it('[User + Org + ExchangeAddress -] Check requirements in My Devices and Register Device', () => {
        cy.visit('/devices/owned');
        cy.contains(
            'The organization has to have a blockchain exchange deposit address attached to the account.'
        );
    });
});
