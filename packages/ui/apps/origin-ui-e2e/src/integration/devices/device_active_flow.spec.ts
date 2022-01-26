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
    cy.apiRegisterAndApproveDevice(testUser, testDevice);

    cy.apiLoginUser(testUser);
    cy.visit('/');
  });

  beforeEach(() => {
    cy.apiLoginUser(testUser);
    cy.visit('/');
  });

  it('should display approved device in All Devices', () => {
    cy.navigateMenu('allDevices');
    cy.contains(`${testUser.firstName}-facility`).should('exist');
  });

  it('should go to Detailed View of newly created device', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('viewDevice').click();
    cy.url().should('include', 'device/detail-view');
    cy.contains(testDevice.facilityName);
  });

  it('should display map in a Detailed View', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('viewDevice').click();
    cy.contains('button', 'Map').click();
    cy.dataCy('map').should('exist');
  });

  it('should check Request certificates modal behaviour', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('myDeviceCard').click();

    cy.contains('Request Certificates');
    cy.contains('p', `${testUser.firstName}-facility`).should('exist');

    cy.dataCy('certificatesEnergy').should('have.value', '');
    cy.dataCy('fromTime').should('be.ok');
    cy.dataCy('toTime').should('be.ok');
    cy.attachDocument('requestCertificateUpload');
    cy.contains('testDocument.json').should('exist');
  });

  it('should Request certificates for current date', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('myDeviceCard').click();

    cy.dataCy('certificatesEnergy').filter(':visible').type('100');
    cy.dataCy('requestCertificatesButton').filter(':visible').click();
    cy.notification('Certificate has been successfully requested');
    cy.url().should('include', 'device/my');
  });

  it('should show error if request certificates for the same period has already been requested', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('myDeviceCard').click();

    cy.dataCy('certificatesEnergy').filter(':visible').type('100');
    cy.dataCy('requestCertificatesButton').filter(':visible').click();
    cy.notification(
      'There is already a certificate requested for that time period'
    );
  });

  it('should request certificates with monthly-weekly difference', () => {
    cy.navigateMenu('myDevices');
    cy.dataCy('myDeviceCard').click();

    cy.dataCy('certificatesEnergy').filter(':visible').type('100');

    cy.dataCy('fromTime').filter(':visible').click();
    cy.get('button[title="Previous month"]').click();
    cy.get('.MuiCalendarPicker-root').within(() => {
      cy.contains('button', '1').filter(':visible').click();
    });
    cy.selectDate('toTime', '1');

    cy.dataCy('requestCertificatesButton').filter(':visible').click();
    cy.notification('Certificate has been successfully requested');
  });

  it('should display approved device status in My Devices', () => {
    cy.visit('/device/my');
    cy.dataCy('deviceStatus').find('span').trigger('mouseover');
    cy.contains(DeviceState.Approved);
    cy.dataCy('editDevice').should('not.exist');
  });

  it('should display approved device in All Devices', () => {
    cy.navigateMenu('myDevices');
  });
});
