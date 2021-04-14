/// <reference types="cypress" />
/// <reference types="../../support" />

import { generateNewOrg, generateNewUser, generateNewDevice } from '../../utils/generateMockData';

describe('Check newly registered device status', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const testDevice = generateNewDevice(testUser);

    const openRequestCertificatesModal = () => {
        cy.dataCy('speed-dial-icon').trigger('mouseover');
        cy.contains('Request certificates');
        cy.dataCy('Request certificates').click();
    };

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);
        cy.apiRegisterAndApproveDevice(testUser, testDevice);

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

    it('should display approved device in All Devices', () => {
        cy.dataCy('production').click();
        cy.wait(300);
        cy.contains(`${testUser.firstName}-facility`).should('exist');
    });

    it('should go to Detailed View of newly created device', () => {
        cy.dataCy('owned').click();
        cy.contains('Active');
        cy.dataCy('speed-dial-icon').trigger('mouseover');
        cy.contains('View details').should('exist');
        cy.contains('Request certificates').should('exist');
    });

    it('should check Request certificates modal behaviour', () => {
        cy.dataCy('owned').click();
        cy.dataCy('speed-dial-icon').trigger('mouseover');
        cy.contains('Request certificates');
        cy.dataCy('Request certificates').click();
        cy.contains(`${testUser.firstName}-facility`).should('exist');

        cy.dataCy('request-certificates-submit').should('be.disabled');
        cy.dataCy('request-certificates-capacity').find('input').should('have.value', '');
        cy.dataCy('request-certificates-date-from').find('input').should('be.ok');
        cy.dataCy('request-certificates-date-to').find('input').should('be.ok');
        cy.attachDocument('request-certificates-upload');
        cy.contains('testDocument.json').should('exist');
    });

    it('should Request certificates for current date', () => {
        cy.dataCy('owned').click();
        openRequestCertificatesModal();

        cy.attachDocument('request-certificates-upload');
        cy.dataCy('request-certificates-capacity').find('input').type('100');
        cy.dataCy('request-certificates-submit').click();
        cy.notification('Certificates requested.').should('exist');

        openRequestCertificatesModal();
        cy.dataCy('request-certificates-capacity').find('input').should('have.value', '');
        cy.contains('testDocument.json').should('not.exist');
    });

    it('should show error if request certificates for the same period has already been requested', () => {
        cy.dataCy('owned').click();
        openRequestCertificatesModal();

        cy.dataCy('request-certificates-capacity').find('input').type('100');

        cy.dataCy('request-certificates-date-from').find('input').click();
        cy.get('[class*="MuiPickersDay-daySelected"]').click().type('{enter}');
        cy.dataCy('request-certificates-date-to').find('input').click();
        cy.get('[class*="MuiPickersDay-daySelected"]').click().type('{enter}');

        cy.dataCy('request-certificates-submit').click();
        cy.notification('There is already a certificate requested for that time period.').should(
            'exist'
        );
    });

    it('should request certificates with monthly-weekly difference', () => {
        cy.dataCy('owned').click();
        openRequestCertificatesModal();

        cy.dataCy('request-certificates-capacity').find('input').type('100');
        cy.dataCy('request-certificates-date-from').find('input').click();
        cy.get('[class*="MuiPickersCalendarHeader-iconButton"]').eq(1).click();
        cy.get('[class*="MuiPickersCalendar-week"]').contains('15').click().type('{enter}');

        cy.dataCy('request-certificates-date-to').find('input').click();
        cy.get('[class*="MuiPickersCalendarHeader-iconButton"]').eq(1).click().click();
        cy.get('[class*="MuiPickersCalendar-week"]').contains('15').click().type('{enter}');

        cy.dataCy('request-certificates-submit').click();
        cy.notification('Certificates requested.').should('exist');
    });
});
