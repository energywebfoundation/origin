/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewUser } from '../../utils/generateNewUser';

describe('Active user profile page interactions', () => {
    const testUser = generateNewUser();
    const { password: oldPassword, email, firstName, lastName } = testUser;
    const editNumbers = '1111';
    const newPassword = oldPassword + editNumbers;

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');
    });

    it('should validate password field as required', () => {
        cy.dataCy('password-edit-button').click();
        cy.inputRequired('current-password', 'new-password');
        cy.inputRequired('new-password', 'confirm-password');
        cy.inputRequired('confirm-password', 'current-password');
    });

    it('should revert changes password inputs after cancel button is clicked', () => {
        cy.dataCy('password-edit-button').click();

        cy.dataCy('current-password').type(oldPassword);
        cy.dataCy('password-save-button').should('be.disabled');
        cy.dataCy('current-password').find('input').should('have.value', oldPassword);

        cy.dataCy('new-password').type(newPassword);
        cy.dataCy('password-save-button').should('be.disabled');
        cy.dataCy('new-password').find('input').should('have.value', newPassword);

        cy.dataCy('confirm-password').type(newPassword);
        cy.dataCy('password-save-button').should('not.be.disabled');
        cy.dataCy('confirm-password').find('input').should('have.value', newPassword);

        cy.dataCy('password-cancel-button').click();
        cy.dataCy('current-password').find('input').should('have.value', '');
        cy.dataCy('new-password').find('input').should('have.value', '');
        cy.dataCy('confirm-password').find('input').should('have.value', '');
    });

    it('should allow user to change password and logout', () => {
        cy.dataCy('password-edit-button').click();

        cy.dataCy('current-password').type(oldPassword);
        cy.dataCy('new-password').type(newPassword);
        cy.dataCy('confirm-password').type(newPassword);
        cy.dataCy('password-save-button').click();

        cy.notification('User password updated');
        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
        cy.url().should('include', 'devices/production');
        cy.get('.toast').click();
        cy.wait(500);
        cy.dataCy('user-logout-button').click();
    });

    it('should allow user to log in using new password', () => {
        cy.visit('/user-login');
        cy.fillUserLogin({ email, password: newPassword });
        cy.dataCy('login-button').click();

        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();

        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
        cy.url().should('include', 'devices/production');
    });
});
