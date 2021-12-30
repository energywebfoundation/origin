/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('User login', () => {
  const testUser = generateNewUser();
  const loginUrl = '/login';

  before(() => {
    cy.apiRegisterUser(testUser);
  });

  beforeEach(() => {
    cy.visit(loginUrl);
  });

  it('should visit register user form', () => {
    cy.dataCy('register-now-button').click();
    cy.url().should('include', '/auth/register');
  });

  it('should not allow login with wrong password', () => {
    cy.login(testUser.email, testUser.password + '0');

    cy.url().should('include', loginUrl);
    cy.notification('Could not log in with supplied credentials');
  });

  it('should not allow login with wrong email', () => {
    cy.login('wrong' + testUser.email, testUser.password);

    cy.url().should('include', loginUrl);
    cy.notification('Could not log in with supplied credentials');
  });

  it('should login user', () => {
    cy.login(testUser.email, testUser.password);

    cy.contains('Thank you for registering as a user on the marketplace');
  });

  it('should redirect to default page after modal action', () => {
    cy.login(testUser.email, testUser.password);

    cy.contains('Thank you for registering as a user on the marketplace');
    cy.get('button').contains('Not now').click();
    cy.url().should('include', '/device/all');
    cy.contains(`${testUser.firstName} ${testUser.lastName}`);
  });

  it('should redirect to Register Org page after modal action', () => {
    cy.login(testUser.email, testUser.password);

    cy.contains('Thank you for registering as a user on the marketplace');
    cy.get('button').contains('Register Organization').click();
    cy.url().should('include', '/organization/register');
  });
});
