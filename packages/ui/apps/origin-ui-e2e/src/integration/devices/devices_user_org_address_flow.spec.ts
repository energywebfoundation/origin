/// <reference types="cypress" />

import {
  generateNewOrg,
  generateNewUser,
  generateNewDevice,
} from '../../utils/generateMockData';

describe('Devices for registered user', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);
  const testDevice = generateNewDevice(testUser);

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterAndApproveOrg(testUser, testOrg);

    cy.apiLoginUser(testUser);
    cy.visit('/device/all');
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
  });

  it('All device pages should be accessible', () => {
    cy.dataCy('deviceMenu').click();

    cy.navigateMenu('allDevices');
    cy.url().should('include', 'all');
    cy.contains(
      'To access this page, you need to fulfill following criteria'
    ).should('not.exist');

    cy.navigateMenu('devicesMap');
    cy.url().should('include', 'map');
    cy.contains(
      'To access this page, you need to fulfill following criteria'
    ).should('not.exist');

    cy.navigateMenu('myDevices');
    cy.url().should('include', 'my');
    cy.contains(
      'To access this page, you need to fulfill following criteria'
    ).should('not.exist');

    cy.navigateMenu('registerDevice');
    cy.url().should('include', 'register');
    cy.contains(
      'To access this page, you need to fulfill following criteria'
    ).should('not.exist');
  });

  it('should redirect to Register Device when click on My Devices Register button', () => {
    cy.dataCy('deviceMenu').click();
    cy.navigateMenu('myDevices');
    cy.url().should('include', 'my');

    cy.dataCy('myRegisterDevice').click();
    cy.url().should('include', 'register');
  });

  it('should complete device registration', () => {
    cy.visit('/device/register');

    cy.fillDeviceForm(testUser, testDevice);
    cy.fillDeviceImagesForm();
    cy.submitForm();
    cy.notification('New device created successfully');
  });

  it('should display registered device status', () => {
    cy.contains(testDevice.facilityName);
    cy.contains(testDevice.region);
    cy.contains(testDevice.subregion);
  });
});
