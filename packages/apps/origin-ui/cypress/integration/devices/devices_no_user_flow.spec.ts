/// <reference types="cypress" />

describe('Devices for not registered user', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should show default devices in All Devices', () => {
        cy.dataCy('production').click();

        cy.url().should('include', 'devices/production');
        cy.dataCy('production').find('a').should('have.class', 'active');

        cy.contains('Wuthering Heights Windfarm');
        cy.contains('Solar Facility A');
        cy.contains('Biomass Facility');
    });

    it('should not dislay My Devices and Register Device', () => {
        cy.dataCy('owned').should('not.exist');
        cy.dataCy('add').should('not.exist');
    });
});
