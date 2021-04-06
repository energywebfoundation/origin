/// <reference types="cypress" />
import 'cypress-file-upload';

Cypress.Commands.add('dataCy', (value: string) => {
    cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add('inputRequired', (target: string, neighbor: string) => {
    cy.dataCy(target).then((elem) => {
        const fieldName = elem.text().slice(0, -2);

        cy.dataCy(target).click();
        cy.dataCy(neighbor).click();

        cy.contains(`${fieldName} is a required field`);
    });
});

Cypress.Commands.add('clearInput', (target: string) => {
    cy.dataCy(target).find('input').clear();
});

Cypress.Commands.add('filledInputRequired', (target: string, neighbor: string) => {
    cy.dataCy(target).then((elem) => {
        const fieldName = elem.text().slice(0, -2);

        cy.clearInput(target);
        cy.dataCy(neighbor).click();

        cy.contains(`${fieldName} is a required field`);
    });
});

Cypress.Commands.add('notification', (text: string) => {
    cy.get('.toast').contains(text);
});

Cypress.Commands.add('attachDocument', (uploadDataCy: string) => {
    cy.dataCy(uploadDataCy).find('input').attachFile({
        filePath: 'testDocument.json',
        mimeType: 'image/png',
        encoding: 'binary'
    });
});

Cypress.Commands.add('inputHasValue', (inputCy: string, value: string) => {
    cy.dataCy(inputCy).find('input').should('have.value', value);
});
