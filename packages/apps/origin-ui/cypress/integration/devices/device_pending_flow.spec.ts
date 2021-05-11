/// <reference types="cypress" />
/// <reference types="../../support" />

import { generateNewOrg, generateNewUser, generateNewDevice } from '../../utils/generateMockData';

describe('Check newly registered device status', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const testDevice = generateNewDevice(testUser);

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);
        cy.apiRegisterDevice(testUser, testDevice);

        cy.apiLoginUser(testUser);
        cy.visit('/');

        cy.dataCy('settings-menu').click();
        cy.dataCy('user-profile').click();

        cy.dataCy('exchange-address-create-button').click();

        cy.visit('/devices/owned');
    });

    it('should not have the “Request certificates“, only the “View details“ for newly created device', () => {
        cy.dataCy('speed-dial-icon').trigger('mouseover');
        cy.contains('View details');
        cy.contains('Request certificates').should('not.exist');
    });

    it('should go to Detailed View of newly created device', () => {
        cy.dataCy('View details').click();
    });

    it('should not display newly created device in All Devices', () => {
        cy.dataCy('production').click();
        cy.wait(300);
        cy.contains(`${testUser.firstName}-facility`).should('not.exist');
    });
});
