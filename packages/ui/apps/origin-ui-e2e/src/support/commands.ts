// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import 'cypress-file-upload';
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});

Cypress.Commands.add('dataCy', (value: string) => {
  cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add('inputRequired', (target: string, neighbor: string) => {
  cy.dataCy(target).then((elem) => {
    cy.clearInput(target);
    cy.dataCy(neighbor).click();

    const fieldName = elem
      // @ts-ignore
      .parent()
      .parent()
      .find('label')
      .text()
      .replace(/\s[*]/, '');
    cy.contains(`${fieldName} is a required field`);
  });
});

Cypress.Commands.add('clearInput', (target: string) => {
  cy.dataCy(target).clear();
});

Cypress.Commands.add(
  'filledInputRequired',
  (target: string, neighbor: string) => {
    cy.clearInput(target);
    cy.dataCy(neighbor).click();
    cy.dataCy(`${target}-label`).then((elem) => {
      // @ts-ignore
      const fieldName = elem.text().replace(/\s[*]/, '');
      cy.contains(`${fieldName} is a required field`);
    });
  }
);

Cypress.Commands.add('closeAllNotifications', () => {
  cy.get('.Toastify__toast').click({ multiple: true, force: true });
});

Cypress.Commands.add('notification', (text: string) => {
  cy.get('.Toastify__toast').contains(text);
  cy.closeAllNotifications();
});

Cypress.Commands.add('attachDocument', (uploadDataCy: string) => {
  cy.dataCy(uploadDataCy).find('input').attachFile({
    filePath: 'testDocument.json',
    mimeType: 'image/png',
    encoding: 'binary',
  });
});

Cypress.Commands.add(
  'attachMultipleDocuments',
  (uploadDataCy: string, count: number) => {
    const files = new Array(count).fill({
      filePath: 'testDocument.json',
      mimeType: 'image/png',
      encoding: 'binary',
    });
    cy.dataCy(uploadDataCy).find('input').attachFile(files);
  }
);

Cypress.Commands.add('inputHasValue', (inputCy: string, value: string) => {
  cy.dataCy(inputCy).find('input').should('have.value', value);
});
