import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Devices for registered user', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);

        cy.apiLoginUser(testUser);
        cy.visit('/');

        cy.dataCy('settings-menu').click();
        cy.dataCy('user-profile').click();

        cy.dataCy('exchange-address-create-button').click();
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/');
    });

    it('All device pages should be accessible', () => {
        cy.visit('/devices/production');
        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
        cy.visit('/devices/production-map');
        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
        cy.visit('/devices/owned');
        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
        cy.visit('/devices/add');
        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
    });

    it('Register device button from My Devices should redirect to Register Device', () => {
        cy.visit('/devices/owned');
        cy.wait(100);
        cy.dataCy('plus-device-button').should('exist').click({ force: true });
        cy.url().should('include', 'add');
    });

    it('Complete device registration', () => {
        cy.visit('/devices/add');
        cy.dataCy('facilityName').type('test');
        cy.dataCy('device-type').find('input').click().type('Sol');
        cy.contains('Solar').click();

        cy.dataCy('device-type').find('input').eq(1).click().type('Pho');
        cy.contains('Solar - Photovoltaic').click();

        cy.dataCy('device-type').find('input').eq(2).click().type('Roof');
        cy.contains('Solar - Photovoltaic - Roof mounted').click();

        cy.dataCy('commissioningDate').click();
        cy.get('[class*="MuiPickersDay-daySelected"]').click();

        cy.dataCy('registrationDate').click();
        cy.get('[class*="MuiPickersDay-daySelected"]').click();

        cy.dataCy('supported').click();

        cy.dataCy('capacity').type('1000');

        cy.dataCy('Regions').click().type('No');
        cy.contains('Northeast').click();
        cy.dataCy('Provinces').click().type('Amn');
        cy.contains('Amnat Charoen').click();
        cy.dataCy('Grid operator').click().type('TH');
        cy.contains('TH-MEA').click();

        cy.dataCy('address').type('Random street 5', { delay: 1 });
        cy.dataCy('latitude').type('00,00', { delay: 1 });
        cy.dataCy('longitude').type('00,00', { delay: 1 });
        cy.dataCy('projectStory').type('long long time ago in far away project', { delay: 1 });

        cy.dataCy('device-register-submit').should('not.be.disabled').click();
    });
    //
    // it('[Device approval -] Check newly registered device status.', () => {
    //
    // });
    //
    // it('Newly created device should not have the “Request certificates button“, only the “View details“', () => {
    //
    // });
    //
    // it('Go to Detail View of newly created device', () => {
    //
    // });
    //
    // it('Newly created device should not be displayed in All Devices', () => {
    //
    // });
    //
    // it('[Device approval +] Approved device should be seen in All Devices', () => {
    //
    // });
    //
    // it('Check device displayed status in My Devices and available actions (Request Certificates and View Details)', () => {
    //
    // });
    //
    // describe('Check Request Certificates modal behaviour:', () => {
    //     it('- Displayed data(device name, date, etc.)', () => {
    //
    //     });
    //
    //     it('- Check validation', () => {
    //
    //     });
    //
    //     it('- Try to upload a file', () => {
    //
    //     });
    // });
    //
    // it('Try Requesting certificates for current date - should be successful', () => {
    //
    // });
    //
    // it('Retry the same action - should end up with error, telling that Certificate for this period has already been requested.', () => {
    //
    // });
    //
    //
    // it('Check if volume in the Request Modal is reset after certificate request.', () => {
    //
    // });
    //
    //
    // it('Try requesting certificates for another time period, with monthly-weekly difference.', () => {
    //
    // });
});
