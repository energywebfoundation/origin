import 'cypress-file-upload';
import 'cypress-wait-until';

Cypress.Commands.add('dataCy', (value: string) => {
  cy.get(`[data-cy="${value}"]`);
});

Cypress.Commands.add('selectValue', (target: string, value: string) => {
  cy.dataCy(target).parent().click();
  cy.contains(value).click();
});

Cypress.Commands.add('selectValueByIndex', (target: string, index: string) => {
  cy.dataCy(target).parent().click();
  cy.get(`li[data-value=${index}]`).click();
});

Cypress.Commands.add('selectMultiple', (target: string, values: string[]) => {
  values.forEach((value) => {
    cy.dataCy(target).parent().click();
    cy.contains(value).click();
  });
});

Cypress.Commands.add('selectDate', (target: string, day: string) => {
  cy.dataCy(target).filter(':visible').click();
  cy.get('.MuiCalendarPicker-root').within(() => {
    cy.contains('button', day).filter(':visible').click();
  });
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

Cypress.Commands.add('navigateMenu', (target: string) => {
  cy.dataCy(target).filter(':visible').click();
});

Cypress.Commands.add('closeAllNotifications', () => {
  cy.get('.Toastify__toast')
    .click({
      multiple: true,
      force: true,
    })
    .waitUntil(
      () =>
        cy
          .get('.Toastify__toast')
          .should('not.exist')
          .then((elem) => elem === null),
      { timeout: 30000 }
    );
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
  cy.dataCy(inputCy).should('have.value', value);
});

Cypress.Commands.add('nextStep', () => {
  cy.contains('Next Step').should('not.be.disabled').click();
});

Cypress.Commands.add('submitForm', () => {
  cy.contains('Submit').should('not.be.disabled').click();
});
