/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewUser } from '../../utils/generateNewUser';

describe('Inactive user profile page interactions', () => {
    const testUser = generateNewUser();
    const editText = 'edited';
    const editNumbers = '1111';

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');
    });

    it('should not show pending badge', () => {
        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
        cy.dataCy('user-pending-badge').should('not.exist');
    });

    it('should show pop-ups for blockchain addresses fields', () => {
        cy.dataCy('exchange-address-info-icon').trigger('mouseover');
        cy.contains('You need it to trade certificates on the exchange');

        cy.dataCy('blockchain-address-info-icon').trigger('mouseover');
        cy.contains('A connected user blockchain address is required to withdraw');
    });

    it('should validate user info fields as required', () => {
        cy.dataCy('info-edit-button').click();
        cy.filledInputRequired('first-name', 'last-name');
        cy.filledInputRequired('last-name', 'telephone');
        cy.filledInputRequired('telephone', 'first-name');
    });

    it('should revert changes to user info inputs after cancel button is clicked', () => {
        const { firstName, lastName, telephone } = testUser;

        cy.dataCy('info-edit-button').click();
        cy.dataCy('first-name').type(editText);
        cy.dataCy('first-name')
            .find('input')
            .should('have.value', firstName + editText);
        cy.dataCy('info-save-button').should('not.be.disabled');
        cy.dataCy('info-cancel-button').click();
        cy.dataCy('first-name').find('input').should('have.value', firstName);

        cy.dataCy('info-edit-button').click();
        cy.dataCy('last-name').type(editText);
        cy.dataCy('last-name')
            .find('input')
            .should('have.value', lastName + editText);
        cy.dataCy('info-save-button').should('not.be.disabled');
        cy.dataCy('info-cancel-button').click();
        cy.dataCy('last-name').find('input').should('have.value', lastName);

        cy.dataCy('info-edit-button').click();
        cy.dataCy('telephone').type(editNumbers);
        cy.dataCy('telephone')
            .find('input')
            .should('have.value', telephone + editNumbers);
        cy.dataCy('info-save-button').should('not.be.disabled');
        cy.dataCy('info-cancel-button').click();
        cy.dataCy('telephone').find('input').should('have.value', telephone);
    });

    it('should allow to change user info', () => {
        const { firstName, lastName, telephone } = testUser;

        cy.dataCy('info-edit-button').click();
        cy.dataCy('first-name').type(editText);
        cy.dataCy('last-name').type(editText);
        cy.dataCy('telephone').type(editNumbers);
        cy.dataCy('first-name')
            .find('input')
            .should('have.value', firstName + editText);
        cy.dataCy('last-name')
            .find('input')
            .should('have.value', lastName + editText);
        cy.dataCy('telephone')
            .find('input')
            .should('have.value', telephone + editNumbers);
        cy.dataCy('info-save-button').should('not.be.disabled');

        cy.dataCy('info-save-button').click();
        cy.notification('User profile updated');
        cy.visit('/');
        cy.visit('/account/user-profile');

        cy.dataCy('info-edit-button').click();
        cy.clearInput('first-name');
        cy.clearInput('last-name');
        cy.clearInput('telephone');
        cy.dataCy('first-name').type(firstName);
        cy.dataCy('last-name').type(lastName);
        cy.dataCy('telephone').type(telephone);
        cy.dataCy('info-save-button').click();
        cy.notification('User profile updated');
    });

    it('should validate email field as required', () => {
        cy.dataCy('email-edit-button').click();
        cy.filledInputRequired('email', 'first-name');
        cy.dataCy('info-edit-button').click();
    });

    it('should revert email to default after pressing cancel button', () => {
        cy.dataCy('email-edit-button').click();
        cy.clearInput('email');

        cy.dataCy('email').type(editText + testUser.email);
        cy.dataCy('email')
            .find('input')
            .should('have.value', editText + testUser.email);
        cy.dataCy('email-save-button').should('not.be.disabled');

        cy.dataCy('email-cancel-button').click();
        cy.dataCy('email').find('input').should('have.value', testUser.email);
    });

    it('should keep save email button disabled if email did not changed after editing', () => {
        cy.dataCy('email-edit-button').click();
        cy.clearInput('email');
        cy.dataCy('email').type(testUser.email);
        cy.dataCy('email-save-button').should('be.disabled');
    });

    it('should change user email and allow him to log in with new mail', () => {
        cy.dataCy('email-edit-button').click();

        cy.clearInput('email');
        cy.dataCy('email').type(editText + testUser.email);
        cy.dataCy('email-save-button').should('not.be.disabled');
        cy.dataCy('email-save-button').click();
        cy.notification('User profile updated');
        cy.url().should('include', 'devices/production');

        cy.apiLoginUser({ email: editText + testUser.email, password: testUser.password });
        cy.visit('/account/user-profile');
        cy.dataCy('email-edit-button').click();
        cy.clearInput('email');
        cy.dataCy('email').type(testUser.email);
        cy.dataCy('email-save-button').click();
        cy.notification('User profile updated');
    });

    it('should validate password field as required', () => {
        cy.dataCy('password-edit-button').click();
        cy.inputRequired('current-password', 'new-password');
        cy.inputRequired('new-password', 'confirm-password');
        cy.inputRequired('confirm-password', 'current-password');
    });

    it('should revert changes password inputs after cancel button is clicked', () => {
        const { password: oldPassword } = testUser;
        const newPassword = oldPassword + editNumbers;
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

    it('should allow user to change password, logout and login with new password', () => {
        const { password: oldPassword, email } = testUser;
        const newPassword = oldPassword + editNumbers;
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

        cy.dataCy('user-login-button').click();
        cy.url().should('include', 'user-login');
        cy.fillUserLogin({ email, password: newPassword });
        cy.dataCy('login-button').click();
        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();

        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
        cy.url().should('include', 'devices/production');

        cy.visit('/account/user-profile');
        cy.dataCy('password-edit-button').click();
        cy.dataCy('current-password').type(newPassword);
        cy.dataCy('new-password').type(oldPassword);
        cy.dataCy('confirm-password').type(oldPassword);
        cy.dataCy('password-save-button').click();
        cy.notification('User password updated');
    });

    it('should not allow user to create exchange address untill he is a part of organization', () => {
        cy.dataCy('exchange-address-create-button').click();
        cy.notification('Only members of active organization can perform this action');
        cy.dataCy('exchange-address-create-button').should('not.be.disabled');
    });
});
