/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Organization with status Active and User status active flow', () => {
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

    it('should not display pending badge', () => {
        cy.dataCy('organization-pending-badge').should('not.exist');
    });

    it('should allow to create exchange deposit address', () => {
        cy.dataCy('settings-menu').click();
        cy.dataCy('user-profile').click();

        cy.dataCy('exchange-address-create-button').click();
        cy.notification('Exchange Deposit Address created successfully');
        cy.dataCy('exchange-address-create-button').should('not.exist');
        cy.dataCy('exchange-deposit-address').find('input').should('include.value', '0x');
    });

    it('should not show requirements in devices', () => {
        cy.dataCy('devices-menu').click();

        cy.dataCy('owned').click();
        cy.url().should('include', 'owned');
        cy.contains('Owner');
        cy.contains('Facility name');

        cy.dataCy('add').click();
        cy.url().should('include', 'add');
        cy.contains('Device type');
        cy.contains('button', 'Register');
    });

    it('should not show requirements in certificates', () => {
        cy.dataCy('certificates-menu').click();

        cy.url().should('include', 'inbox');
        cy.contains('Certification Date');

        cy.dataCy('exchange_inbox').click();
        cy.url().should('include', 'exchange_inbox');
        cy.contains('Exchange inbox');
        cy.contains('Sell');

        cy.dataCy('blockchain-inbox').click();
        cy.url().should('include', 'blockchain-inbox');
        cy.contains('Blockchain inbox');
        cy.contains('Deposit');

        cy.dataCy('claims_report').click();
        cy.url().should('include', 'claims_report');
        cy.contains('Compliance');
        cy.contains('Certified Energy');

        cy.dataCy('requests').click();
        cy.url().should('include', 'requests');
        cy.contains('Evidence files');
        cy.contains('Status');
    });

    it('should not show requirements in exchange', () => {
        cy.dataCy('exchange-menu').click();

        cy.url().should('include', 'view-market');
        cy.contains('Market');
        cy.contains('Asks');
        cy.contains('Bids');

        cy.dataCy('bundles').click();
        cy.url().should('include', 'bundles');
        cy.contains('TOTAL ENERGY');
        cy.contains('Price per MWh');

        cy.dataCy('create_bundle').click();
        cy.url().should('include', 'create_bundle');
        cy.contains('Certificates');
        cy.contains('Sell as bundle');

        cy.dataCy('my_bundles').click();
        cy.url().should('include', 'my_bundles');
        cy.contains('WIND');
        cy.contains('OTHER');

        cy.dataCy('my_trades').click();
        cy.url().should('include', 'my_trades');
        cy.contains('Date');
        cy.contains('Side');

        cy.dataCy('my_orders').click();
        cy.url().should('include', 'my_orders');
        cy.contains('DEMANDS');
        cy.contains('OPEN BIDS');
        cy.contains('OPEN ASKS');

        cy.dataCy('supply').click();
        cy.url().should('include', 'exchange/supply');
        cy.contains('Status');
        cy.contains('To be certified');
    });
});
