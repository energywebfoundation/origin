/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('User registration', () => {
  const testUser = generateNewUser();

  before(() => {
    cy.visit('auth/register');
  });

  it('should allow to enter custom title', () => {
    cy.dataCy('register-title-select').parent().click();
    cy.contains('Other').click();
    cy.dataCy('register-other-title-input').type('PhD');
  });

  it('should require first name', () => {
    cy.inputRequired('firstName', 'lastName');
  });

  it('should require last name', () => {
    cy.inputRequired('lastName', 'firstName');
  });

  it('should require email', () => {
    cy.inputRequired('email', 'lastName');
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

    cy.notification('User registered');
    cy.contains('Thanks for registering as a user on the marketplace');
    cy.dataCy('user-registered-modal-ok').click();
    cy.url().should('include', '/login');
  });

  it('should not be able to create user with same email', () => {
    cy.visit('auth/register');

    cy.fillUserRegister(testUser);
    cy.dataCy('register-button').should('not.be.disabled').click();
    cy.notification(`Error while registering user`);
  });
});
