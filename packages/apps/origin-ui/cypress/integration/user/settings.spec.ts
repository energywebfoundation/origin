/// <reference types="cypress" />
/// <reference types="../../support" />

describe('Settings for unlogged user', () => {
    before(() => {
        cy.visit('account/settings');
    });

    it('should be able to change language', () => {
        cy.dataCy('language-select').click();
        cy.contains('pl').click();
        cy.contains('Język');
        cy.contains('Zarejestruj');
        cy.contains('Rynek');
    });
});
