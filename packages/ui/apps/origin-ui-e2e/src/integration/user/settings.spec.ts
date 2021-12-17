/// <reference types="cypress" />

describe('Settings for unlogged user', () => {
  before(() => {
    cy.visit('account/settings');
  });

  it('should be able to change language', () => {
    cy.dataCy('languageSelect').click();
    cy.contains('Polish').click();
    cy.dataCy('updateLanguage').click();

    cy.contains('Zarejestrować');
    cy.contains('Zaloguj sie');
  });
});
