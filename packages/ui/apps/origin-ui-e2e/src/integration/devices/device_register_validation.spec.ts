/// <reference types="cypress" />

import {
  generateNewOrg,
  generateNewUser,
  generateNewDevice,
} from '../../utils/generateMockData';

describe('Register device form validation', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);
  const testDevice = generateNewDevice(testUser);

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterAndApproveOrg(testUser, testOrg);

    cy.apiLoginUser(testUser);
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
    cy.visit('/device/register');
  });

  it('should not be able to choose multiple device types', () => {
    cy.selectValue('fuelType', 'Solar');
    cy.selectValue('fuelType', 'Wind');

    cy.selectValue('deviceType', 'PV Floating');
    cy.selectValue('deviceType', 'PV Aggregated');

    cy.dataCy('fuelType')
      .parent()
      .find('.MuiChip-root')
      .should('have.length', '1')
      .should('have.text', 'Solar');

    cy.dataCy('deviceType')
      .parent()
      .find('.MuiChip-root')
      .should('have.length', '1')
      .should('have.text', 'PV Floating');
  });

  it('should upload single Device Image', () => {
    cy.visit('/device/register');

    cy.fillDeviceForm(testUser, testDevice);
    cy.fillDeviceImagesForm();
    cy.contains('testDocument.json').should('exist');
  });

  it('should upload 10 Device Images', () => {
    cy.visit('/device/register');

    cy.fillDeviceForm(testUser, testDevice);
    cy.attachMultipleDocuments('deviceImages', 10);
    cy.get('.MuiChip-label').should('have.length', '10');
  });
});
