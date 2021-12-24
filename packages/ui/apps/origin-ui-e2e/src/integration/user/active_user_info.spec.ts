/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('Active user profile user info block interactions', () => {
  const testUser = generateNewUser();
  const editText = 'edited';
  const editNumbers = '1111';

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');
  });

  it('should not show pending badge', () => {
    cy.contains(`${testUser.firstName} ${testUser.lastName}`);
    cy.dataCy('user-pending-badge').should('not.exist');
  });

  it('should show pop-up for blockchain addresse fields', () => {
    cy.dataCy('exchange-address-info-icon').trigger('mouseover');
    cy.contains('You need it to trade certificates on the exchange');
  });

  it('should validate user info fields as required', () => {
    cy.inputRequired('firstName', 'lastName');
    cy.inputRequired('lastName', 'telephone');
    cy.inputRequired('telephone', 'firstName');
  });

  it('should allow to change user info', () => {
    const { firstName, lastName, telephone } = testUser;
    const newFirstName = firstName + editText;
    const newLastName = lastName + editText;

    cy.dataCy('firstName').type(editText);
    cy.dataCy('lastName').type(editText);
    cy.dataCy('telephone').type(editNumbers);
    cy.dataCy('firstName').should('have.value', newFirstName);
    cy.dataCy('lastName').should('have.value', newLastName);
    cy.dataCy('telephone').should('have.value', telephone + editNumbers);
    cy.dataCy('user-data-change-button').should('not.be.disabled');

    cy.dataCy('user-data-change-button').click();
    cy.notification('User information updated successfully');
    cy.contains(`${newFirstName} ${newLastName}`);
  });
});
