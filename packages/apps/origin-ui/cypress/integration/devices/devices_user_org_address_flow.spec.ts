/// <reference types="cypress" />
/// <reference types="../../support" />
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
        cy.visit('/devices/production');
    });

    it('All device pages should be accessible', () => {
        cy.dataCy('production').click();
        cy.url().should('include', 'devices/production');

        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
        cy.dataCy('production-map').click();
        cy.url().should('include', 'devices/production-map');

        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
        cy.dataCy('owned').click();
        cy.url().should('include', 'devices/owned');

        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
        cy.dataCy('add').click();
        cy.url().should('include', 'devices/add');

        cy.contains('To access this page, you need to fulfill following criteria').should(
            'not.exist'
        );
    });

    it('should redirect to Register Device when click on My Devices Register button', () => {
        cy.visit('/devices/owned');
        cy.url().should('include', 'devices/owned');
        cy.wait(100);
        cy.dataCy('plus-device-button').should('exist').click();
        cy.url().should('include', 'add');
    });

    it('should complete device registration', () => {
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
        cy.notification('Device has been created');
        cy.get('.toast').click();
    });

    it('should display registered device status', () => {
        cy.dataCy('owned').click();
        cy.contains('test');
        cy.contains('Northeast');
        cy.contains('Amnat Charoen');
        cy.contains('TH-MEA');
        cy.contains('Submitted');
    });
});
