/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';
import { OrganizationInvitationStatus } from '@energyweb/origin-backend-core';

describe('Organization invite form and invitations table', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  const member = generateNewUser();
  const deviceManager = generateNewUser();
  const admin = generateNewUser();

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterAndApproveOrg(testUser, testOrg);
    cy.apiLoginUser(testUser);
    cy.visit('/');

    cy.visit('/organization/invite');
    cy.url().should('include', '/organization/invite');
  });

  it('should allow to send invitation for member', () => {
    cy.dataCy('inviteEmail').type(member.email).blur();
    cy.contains('Member');
    cy.contains('button', 'Invite').click();
    cy.notification('Invitation sent');
    // // testing formReset
    cy.dataCy('inviteEmail').should('have.value', '');
  });

  it('should allow to send invitation for device manager', () => {
    cy.dataCy('inviteEmail').type(deviceManager.email).blur();
    cy.selectValueByIndex('inviteRole', '2');
    cy.contains('button', 'Invite').click();
    cy.notification('Invitation sent');

    // testing formReset
    cy.dataCy('inviteEmail').should('have.value', '');
  });

  it('should allow to send invitation for admin', () => {
    cy.dataCy('inviteEmail').type(admin.email).blur();
    cy.selectValueByIndex('inviteRole', '1');
    cy.contains('button', 'Invite').click();
    cy.notification('Invitation sent');
  });

  it('should not allow to send invitation to already invited user', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/organization/invite');
    cy.clearLocalStorage();

    cy.dataCy('inviteEmail').type(member.email).blur();
    cy.contains('Member');
    cy.contains('button', 'Invite').click();
    cy.notification('You have already sent an invitation for this user');
  });

  it('should not allow to send invitation to a user who is a part of another organization', () => {
    cy.clearLocalStorage();

    const anotherTestUser = generateNewUser();
    const anotherTestOrg = generateNewOrg(anotherTestUser);
    cy.apiRegisterUser(anotherTestUser);
    cy.apiRegisterOrg(anotherTestUser, anotherTestOrg);
    cy.clearLocalStorage();

    cy.apiLoginUser(testUser);
    cy.visit('/organization/invite');
    cy.url().should('include', '/organization/invite');

    cy.dataCy('inviteEmail').type(anotherTestUser.email).blur();
    cy.contains('button', 'Invite').click();
    cy.notification('Could not invite user to organization');
  });

  it('should show invitation with pending status', () => {
    cy.navigateMenu('organizationInvitations');
    cy.url().should('include', '/organization/invitations');
    cy.contains('tr', member.email).contains(
      'td',
      OrganizationInvitationStatus.Pending
    );
    cy.contains('tr', deviceManager.email).contains(
      'td',
      OrganizationInvitationStatus.Pending
    );
    cy.contains('tr', admin.email).contains(
      'td',
      OrganizationInvitationStatus.Pending
    );
    cy.contains('1–3 of 3');
  });

  it('should show invitation with approved status', () => {
    cy.clearLocalStorage();
    cy.apiRegisterUser(member);
    cy.apiUserProceedInvitation(member, OrganizationInvitationStatus.Accepted);

    cy.apiLoginUser(testUser);
    cy.visit('/');
    cy.dataCy('organizationMenu').click();
    cy.navigateMenu('organizationInvitations');
    cy.url().should('include', '/organization/invitations');

    cy.contains('tr', member.email).contains(
      'td',
      OrganizationInvitationStatus.Accepted
    );
    cy.contains('tr', deviceManager.email).contains(
      'td',
      OrganizationInvitationStatus.Pending
    );
    cy.contains('tr', admin.email).contains(
      'td',
      OrganizationInvitationStatus.Pending
    );
    cy.contains('1–3 of 3');
  });

  it('should show invitation with rejected status', () => {
    cy.clearLocalStorage();
    cy.apiRegisterUser(deviceManager);
    cy.apiUserProceedInvitation(
      deviceManager,
      OrganizationInvitationStatus.Rejected
    );

    cy.apiLoginUser(testUser);
    cy.visit('/');
    cy.dataCy('organizationMenu').click();
    cy.navigateMenu('organizationInvitations');
    cy.url().should('include', '/organization/invitations');

    cy.contains('tr', member.email).contains(
      'td',
      OrganizationInvitationStatus.Accepted
    );
    cy.contains('tr', deviceManager.email).contains(
      'td',
      OrganizationInvitationStatus.Rejected
    );
    cy.contains('tr', admin.email).contains(
      'td',
      OrganizationInvitationStatus.Pending
    );
    cy.contains('1–3 of 3');
  });
});
