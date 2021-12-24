/// <reference types="cypress" />

describe('Devices for not registered user', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should not dislay My Devices and Register Device', () => {
    cy.dataCy('myDevices').should('not.exist');
    cy.dataCy('registerDevice').should('not.exist');
  });
});
