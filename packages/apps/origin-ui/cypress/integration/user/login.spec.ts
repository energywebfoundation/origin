/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewUser } from '../../utils/generateMockData';

describe('User login', () => {
    const testUser = generateNewUser();
    const loginUrl = '/user-login';

    before(() => {
        cy.apiRegisterUser(testUser);
    });

    beforeEach(() => {
        cy.visit(loginUrl);
    });

    it('should visit register user form', () => {
        cy.dataCy('register-now-button').click();
        cy.url().should('include', '/account/user-register');
    });

    it('should require email and password', () => {
        cy.inputRequired('email', 'password');
        cy.inputRequired('password', 'email');
    });

    it('should validate email', () => {
        cy.dataCy('email').type(testUser.firstName);
        cy.dataCy('password').click();
        cy.contains('must be a valid email');
    });

    it('should not allow login with wrong password', () => {
        const { email, password } = testUser;

        cy.fillUserLogin({ email, password: password + '0' });
        cy.dataCy('login-button').click();

        cy.url().should('include', loginUrl);
        cy.notification('Could not log in with supplied credentials.');
    });

    it('should not allow login with wrong email', () => {
        const { email, password } = testUser;

        cy.fillUserLogin({ password, email: 'wrong' + email });
        cy.dataCy('login-button').click();

        cy.url().should('include', loginUrl);
        cy.notification('Could not log in with supplied credentials.');
    });

    it('should login user', () => {
        const { email, password } = testUser;

        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Thank you for registering as a user on the marketplace');
    });

    it('should redirect to default page after modal action', () => {
        const { email, password } = testUser;

        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();
        cy.url().should('include', '/devices/production');
        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
    });

    it('should redirect to Register Org page after modal action', () => {
        const { email, password } = testUser;

        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Register organization').click();
        cy.url().should('include', '/organization/organization-register');
    });
});
