/// <reference types="cypress" />

import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';
import {
  generateNewOrg,
  generateNewUser,
  generateNewDevice,
} from '../../utils/generateMockData';

describe('Check newly registered device status', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);
  const testDevice = generateNewDevice(testUser);

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterAndApproveOrg(testUser, testOrg);
    cy.apiRegisterDevice(testUser, testDevice);

    cy.apiLoginUser(testUser);
    cy.visit('/device/my');
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
  });

  it('should not allow Request certificates for newly created device', () => {
    cy.contains('button', 'View Details');
    cy.dataCy('myDeviceCard').click();

    cy.dataCy('certificatesEnergy').filter(':visible').type('100');
    cy.dataCy('requestCertificatesButton').filter(':visible').click();
    cy.notification('IREC Device is not approved');
  });

  it('should display pending status', () => {
    cy.visit('/device/my');
    cy.dataCy('deviceStatus').find('span').trigger('mouseover');
    cy.contains(DeviceState.Inprogress);
  });

  it('should go to Detailed View of newly created device', () => {
    cy.visit('/device/my');
    cy.contains('button', 'View Details').click();
    cy.url().should('include', 'device/detail-view');
  });

  it('should not display newly created device in All Devices', () => {
    cy.visit('/device/all');
    cy.contains(`${testUser.firstName}-facility`).should('not.exist');
  });

  it('should edit device', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('editDevice').should('exist').click();
    cy.dataCy('facilityName').type('-edit');

    cy.dataCy('editDeviceButton').click();
    cy.contains(`${testUser.firstName}-facility-edit`);
    cy.contains('button', 'Confirm').click();
    cy.notification('Request for editing device information successfully');
    cy.contains(`${testUser.firstName}-facility-edit`);
  });
});
