/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Organization with status Pending and User active flow', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiLoginUser(testUser);
        cy.visit('/');
        cy.apiRegisterOrg(testOrg);
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
    });

    it('should display appropriate data in My Organization page ', () => {
        cy.dataCy('organizations-menu').click();
        cy.dataCy('my-organization').click();
        cy.url().should('include', 'my-organization');

        cy.dataCy('organization-name').find('input').should('have.value', testOrg.name);
        cy.dataCy('organization-address').find('input').should('have.value', testOrg.address);
        cy.dataCy('organization-business-type')
            .find('input')
            .should('have.value', 'Registered incorporated body');
        cy.dataCy('organization-trade-registry')
            .find('input')
            .should('have.value', testOrg.tradeRegistryCompanyNumber);
        cy.dataCy('organization-vat-number').find('input').should('have.value', testOrg.vatNumber);
        cy.dataCy('organization-signatory-name')
            .find('input')
            .should('have.value', testOrg.signatoryFullName);
        cy.dataCy('organization-signatory-address')
            .find('input')
            .should('have.value', testOrg.signatoryAddress);
        cy.dataCy('organization-signatory-phone')
            .find('input')
            .should('have.value', testOrg.signatoryPhoneNumber);
        cy.dataCy('organization-signatory-status').find('input').should('have.value', 'Submitted');
    });

    it('should display all menu tabs for Organizations menu', () => {
        cy.dataCy('my-organization');
        cy.dataCy('organization-users');
        cy.dataCy('organization-invitations');
        cy.dataCy('register-irec');
    });

    it('should display only Admin of the Organization in Members page', () => {
        cy.dataCy('organization-users').click();
        cy.url().should('include', 'organization-users');

        cy.dataCy('organization-members-page');
        cy.contains(testUser.firstName);
        cy.contains(testUser.lastName);
        cy.contains(testUser.email);
        cy.contains('Admin');
        cy.contains('1-1 of 1');
    });

    it('should display device pages with requirements', () => {
        cy.dataCy('devices-menu').click();

        cy.dataCy('production').click();
        cy.contains('Wuthering Heights Windfarm');

        cy.dataCy('production-map').click();
        cy.url().should('include', 'production-map');

        cy.dataCy('owned').click();
        cy.url().should('include', 'owned');
        cy.contains('You need to be a logged in user');
        cy.contains('The user should be a part of an approved organization');

        cy.dataCy('add').click();
        cy.url().should('include', 'add');
        cy.contains('User has to be approved by the platform admin');
        cy.contains('The organization has to have a blockchain exchange deposit address');
    });

    it('should display certificates pages', () => {
        cy.dataCy('certificates-menu').click();

        cy.url().should('include', 'inbox');
        cy.contains('you need to fulfill following criteria');

        // add exchange inbox check after pulling master
        // add blockchain inbox check after pulling master

        cy.dataCy('claims_report').click();
        cy.url().should('include', 'claims_report');
        cy.contains('The user should be a part of an approved organization');

        cy.dataCy('requests').click();
        cy.url().should('include', 'requests');
        cy.contains('exchange deposit address attached to the account');
    });

    it('should display exchange pages', () => {
        cy.dataCy('exchange-menu').click();

        cy.url().should('include', 'view-market');
        cy.contains('Market');
        cy.contains('One-Time Purchase');
        cy.contains('Repeated Purchase');
        cy.contains('Place Bid Order');
        cy.contains('Asks');
        cy.contains('Bids');

        cy.dataCy('bundles').click();
        cy.url().should('include', 'bundles');
        cy.contains('TOTAL ENERGY');
        cy.contains('Price per MWh');

        cy.dataCy('create_bundle').click();
        cy.url().should('include', 'create_bundle');
        cy.contains('fulfill following criteria');
        cy.contains('exchange deposit address');

        cy.dataCy('my_bundles').click();
        cy.url().should('include', 'my_bundles');
        cy.contains('fulfill following criteria');
        cy.contains('exchange deposit address');

        cy.dataCy('my_trades').click();
        cy.url().should('include', 'my_trades');
        cy.contains('fulfill following criteria');
        cy.contains('exchange deposit address');

        cy.dataCy('my_orders').click();
        cy.url().should('include', 'my_orders');
        cy.contains('fulfill following criteria');
        cy.contains('exchange deposit address');

        cy.dataCy('supply').click();
        cy.url().should('include', 'exchange/supply');
        cy.contains('fulfill following criteria');
        cy.contains('exchange deposit address');
    });

    it('should not allow to create exchange deposit address', () => {
        cy.dataCy('settings-menu').click();
        cy.dataCy('user-profile').click();

        cy.dataCy('exchange-address-create-button').click();
        cy.notification('Only members of active organization can perform this action');
    });
});
