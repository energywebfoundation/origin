/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewUser } from '../../utils/generateMockData';

describe('User with status Pending flow', () => {
    const testUser = generateNewUser();

    before(() => {
        cy.apiRegisterUser(testUser);
    });

    beforeEach(() => {
        const { email, password } = testUser;
        cy.apiLoginUser({ email, password });
    });

    it('should display user name and pending status badge on the Sidebar', () => {
        cy.visit('/');
        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
        cy.dataCy('user-pending-badge').should('have.css', 'background-color', 'rgb(255, 215, 0)');
        cy.dataCy('user-pending-badge').trigger('mouseover');
        cy.contains('Your user account status is pending');
    });

    it('should display device menu for inactive user', () => {
        cy.visit('/devices');
        cy.url().should('include', '/production');

        cy.dataCy('devices-menu');
        cy.dataCy('production');
        cy.dataCy('production-map');

        cy.dataCy('owned').should('not.exist');
        cy.dataCy('add').should('not.exist');
    });

    it('should not display certificates menu', () => {
        cy.dataCy('certificates-menu').should('not.exist');
    });

    it('should display exchange menu for inactive user', () => {
        cy.visit('/exchange');
        cy.url().should('include', '/view-market');

        cy.dataCy('exchange-menu');
        cy.dataCy('view-market');
        cy.dataCy('bundles');

        cy.dataCy('create_bundle').should('not.exist');
        cy.dataCy('my_bundles').should('not.exist');
        cy.dataCy('my_trades').should('not.exist');
        cy.dataCy('my_orders').should('not.exist');
        cy.dataCy('supply').should('not.exist');
    });

    it('should display settings menu for inactive user', () => {
        cy.visit('/account');
        cy.url().should('include', '/settings');

        cy.dataCy('settings-menu');
        cy.dataCy('settings');
        cy.dataCy('user-profile');
    });

    it('should not allow user to change information and email', () => {
        cy.visit('/account/user-profile');
        cy.dataCy('info-edit-button').click();

        cy.dataCy('first-name').type('-edit');
        cy.dataCy('info-save-button').click();
        cy.notification('Error to update User profile');
        cy.get('.toast').click();
        cy.wait(100);

        cy.dataCy('last-name').type('-edit');
        cy.dataCy('info-save-button').click();
        cy.notification('Error to update User profile');
        cy.get('.toast').click();
        cy.wait(200);

        cy.dataCy('telephone').type('-edit');
        cy.dataCy('info-save-button').click();
        cy.notification('Error to update User profile');
        cy.get('.toast').click();
        cy.wait(300);

        cy.dataCy('email-edit-button').click();
        cy.dataCy('email').type('-edit');
        cy.dataCy('email-save-button').click();
        cy.notification('Error to update User profile');
    });

    it('should not allow to change password', () => {
        cy.visit('/account/user-profile');
        cy.dataCy('password-edit-button').click();

        cy.dataCy('current-password').type(testUser.password);
        cy.dataCy('password-save-button').should('be.disabled');

        const newPassword = testUser.password + '0qwe';
        cy.dataCy('new-password').type(newPassword);
        cy.dataCy('password-save-button').should('be.disabled');

        cy.dataCy('confirm-password').type(newPassword);
        cy.dataCy('password-save-button').should('not.be.disabled');
        cy.dataCy('password-save-button').click();
        cy.notification('Error to update User password');
    });

    it('should not allow to create exchange deposit address', () => {
        cy.visit('/account/user-profile');

        cy.dataCy('exchange-address-create-button').click();
        cy.notification('Only active users can perform this action');
    });
});
