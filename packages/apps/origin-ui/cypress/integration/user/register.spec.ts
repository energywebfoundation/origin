/// <reference types="cypress" />
/// <reference types="../../support" />

import { generateNewUser } from '../../utils/generateNewUser';

describe('User registration', () => {
    const testUser = generateNewUser();

    before(() => {
        cy.visit('account/user-register');
    });

    it('should allow to enter custom title', () => {
        cy.dataCy('title-select').click();
        cy.contains('Other').click();
        cy.dataCy('other-title-input').type('PhD');
    });

    it('should require first name', () => {
        cy.inputRequired('first-name', 'last-name');
    });

    it('should require last name', () => {
        cy.inputRequired('last-name', 'first-name');
    });

    it('should require email', () => {
        cy.inputRequired('email', 'last-name');
    });

    it('should require telephone', () => {
        cy.inputRequired('telephone', 'email');
    });

    it('should require password', () => {
        cy.inputRequired('password', 'telephone');
    });

    it('register button should be disabled', () => {
        cy.dataCy('register-button').should('be.disabled');
    });

    it('should create new user', () => {
        cy.fillUserRegister(testUser);

        cy.dataCy('register-button').should('not.be.disabled').click();

        cy.notification('User registered.');
        cy.contains('Thanks for registering a user on the marketplace');
        cy.dataCy('user-registered-modal-ok').click();
        cy.url().should('include', '/user-login');
    });

    it('should not be able to create user with same email', () => {
        cy.visit('account/user-register');

        cy.fillUserRegister(testUser);
        cy.dataCy('register-button').should('not.be.disabled').click();
        cy.notification(
            `The user with email ${testUser.email} has already been registered. Please log in using the original account.`
        );
    });
});
