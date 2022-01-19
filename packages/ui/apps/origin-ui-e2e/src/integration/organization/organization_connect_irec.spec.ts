/// <reference types="cypress" />

import {
  generateNewOrg,
  generateNewUser,
  generateNewDevice,
} from '../../utils/generateMockData';
import testIrecOrg from '../../fixtures/testIRecOrg.json';

describe('Organization irec connection flow', () => {
  const orgOwner = generateNewUser();
  const testOrg = generateNewOrg(orgOwner);
  const testDevice = generateNewDevice(orgOwner);

  before(() => {
    cy.apiRegisterAndApproveUser(orgOwner);
    cy.apiRegisterAndApproveOrg(orgOwner, testOrg);
    cy.apiRegisterAndApproveDevice(orgOwner, testDevice);
    cy.apiRegisterIrecOrg(orgOwner, testIrecOrg);
    cy.visit('/');

    cy.apiLoginUser(orgOwner);
  });

  it('should connect irec', () => {
    cy.dataCy('organizationMenu').click();
    cy.navigateMenu('organizationConnectIRec');

    cy.fillConnectIrecForm();
    cy.submitForm();
    cy.notification('I-REC connection has been successfully set');

    cy.dataCy('connectIRecUserName').should('have.value', '');
    cy.dataCy('connectIRecApiKey').should('have.value', '');
    cy.dataCy('connectIRecClientId').should('have.value', '');
    cy.dataCy('connectIRecClientSecret').should('have.value', '');
  });
});
