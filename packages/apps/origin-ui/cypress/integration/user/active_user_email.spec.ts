/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewUser } from '../../utils/generateMockData';

describe('Active user profile email block interactions', () => {
    const testUser = generateNewUser();
    const editText = 'edited';
    const newEmail = editText + testUser.email;

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
    });

    it('should validate email field as required', () => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');

        cy.dataCy('email-edit-button').click();
        cy.filledInputRequired('email', 'first-name');
        cy.dataCy('info-edit-button').click();
    });

    it('should revert email to default after pressing cancel button', () => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');

        cy.dataCy('email-edit-button').click();
        cy.clearInput('email');

        cy.dataCy('email').find('input').type(newEmail).blur();
        cy.dataCy('email').find('input').should('have.value', newEmail);
        cy.dataCy('email-save-button').should('not.be.disabled');

        cy.dataCy('email-cancel-button').click();
        cy.dataCy('email').find('input').should('have.value', testUser.email);
    });

    it('should keep save email button disabled if email did not changed after editing', () => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');

        cy.dataCy('email-edit-button').click();
        cy.clearInput('email');
        cy.dataCy('email').type(testUser.email);
        cy.dataCy('email-save-button').should('be.disabled');
    });

    it('should change user email and log him out', () => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');

        cy.dataCy('email-edit-button').click();
        cy.clearInput('email');

        cy.dataCy('email').find('input').type(newEmail).blur();
        cy.dataCy('email-save-button').should('not.be.disabled');
        cy.dataCy('email-save-button').click();

        cy.notification('User profile updated');
        cy.url().should('include', 'devices/production');
    });

    it('should allow user to log in using new email', () => {
        cy.visit('/user-login');

        cy.fillUserLogin({ email: newEmail, password: testUser.password });
        cy.dataCy('login-button').click();
        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();
        cy.url().should('include', '/devices/production');
        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
    });
});
