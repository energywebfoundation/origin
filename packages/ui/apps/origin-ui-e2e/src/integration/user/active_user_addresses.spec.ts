/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('Active user profile page blockchain addresses interactions', () => {
  const testUser = generateNewUser();

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
    cy.visit('/account/profile');
  });

  it('should show pop-up for blockchain address fields', () => {
    cy.dataCy('exchange-address-info-icon').trigger('mouseover');
    cy.contains('You need it to trade certificates on the exchange');
  });
});
