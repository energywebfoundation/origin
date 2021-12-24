/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';
import { Role } from '@energyweb/origin-backend-core';

describe('User invitation flow', () => {
  const orgOwner = generateNewUser();
  const testOrg = generateNewOrg(orgOwner);

  const memberAccept = generateNewUser();
  const memberReject = generateNewUser();
  const deviceManager = generateNewUser();
  const admin = generateNewUser();

  before(() => {
    cy.apiRegisterAndApproveUser(orgOwner);
    cy.apiRegisterAndApproveOrg(orgOwner, testOrg);

    cy.apiRegisterUser(memberAccept);
    cy.apiRegisterUser(memberReject);
    cy.apiRegisterUser(deviceManager);
    cy.apiRegisterUser(admin);

    cy.apiSendInvitation(orgOwner, memberAccept.email, Role.OrganizationUser);
    cy.apiSendInvitation(orgOwner, memberReject.email, Role.OrganizationUser);
    cy.apiSendInvitation(
      orgOwner,
      deviceManager.email,
      Role.OrganizationDeviceManager
    );
    cy.apiSendInvitation(orgOwner, admin.email, Role.OrganizationAdmin);
    cy.visit('/');
  });

  it('should show modal and allow to skip it', () => {
    cy.login(memberAccept.email, memberAccept.password);

    cy.contains('Invitation to join the organization on marketplace');
    cy.contains(orgOwner.firstName);
    cy.contains(orgOwner.lastName);
    cy.contains(testOrg.name);
    cy.contains('Later').click();
    cy.notification('You can find this invitation on the Organizations tab');

    cy.url().should('include', '/device/all');
    cy.contains(testOrg.name).should('not.exist');
  });

  it('should allow to accept invitation through invitations table', () => {
    cy.apiLoginUser(memberAccept);

    cy.dataCy('organizationMenu').click();
    cy.navigateMenu('organizationInvitations');
    cy.url().should('include', 'organization/invitations');

    cy.contains('Received');
    cy.contains('tr', memberAccept.email);
    cy.dataCy('moreIcon').trigger('mouseover');
    cy.dataCy('checkIcon').click();

    cy.notification('Invitation accepted');
    cy.contains('Successfully joined');
    cy.contains('As an Organization Admin you have permission to:');
    cy.contains('Place orders on the exchange');
    cy.contains('button', 'Ok').click();
    cy.contains('button', 'Not now').click();
    cy.contains('Thank you for registering');
    cy.contains('button', 'Ok').click();

    cy.url().should('include', 'organization/my');

    cy.contains('label', 'Organization Name')
      .parent()
      .find('input')
      .should('have.value', testOrg.name);

    cy.dataCy('organizationMenu').should('not.exist');

    cy.clearLocalStorage();
  });

  it('should allow to decline invitation through invitations table', () => {
    cy.login(memberReject.email, memberReject.password);

    cy.contains('Invitation to join the organization on marketplace');
    cy.contains(orgOwner.firstName);
    cy.contains(orgOwner.lastName);
    cy.contains(testOrg.name);
    cy.contains('Later').click();
    cy.notification('You can find this invitation on the Organizations tab');

    cy.dataCy('organizationMenu').click();
    cy.navigateMenu('organizationInvitations');
    cy.url().should('include', 'organization/invitations');

    cy.contains('tr', memberReject.email);
    cy.dataCy('moreIcon').trigger('mouseover');
    cy.dataCy('clearIcon').click();
    cy.notification('Invitation rejected');
    cy.contains('tr', memberReject.email).contains('td', 'Rejected');
    cy.dataCy('organizationMenu');

    cy.clearLocalStorage();
  });

  it('should allow to accept invitation through modal window', () => {
    cy.login(deviceManager.email, deviceManager.password);

    cy.contains('Invitation to join the organization on marketplace');
    cy.contains(orgOwner.firstName);
    cy.contains(orgOwner.lastName);
    cy.contains(testOrg.name);
    cy.contains('Accept').click();
    cy.notification('Invitation accepted');

    cy.url().should('include', 'device/all');
    cy.contains(testOrg.name);

    cy.visit('/organization/my');
    cy.url().should('include', 'organization/my');

    cy.contains('label', 'Organization Name')
      .parent()
      .find('input')
      .should('have.value', testOrg.name);

    cy.clearLocalStorage();
  });

  it('should allow to decline invitation through modal window', () => {
    cy.login(admin.email, admin.password);

    cy.contains('Invitation to join the organization on marketplace');
    cy.contains(orgOwner.firstName);
    cy.contains(orgOwner.lastName);
    cy.contains(testOrg.name);
    cy.contains('Decline').click();
    cy.notification('Invitation rejected');

    cy.url().should('include', 'device/all');
    cy.contains(testOrg.name).should('not.exist');
    cy.dataCy('organizationMenu');
  });
});
