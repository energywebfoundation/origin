/// <reference types="cypress" />

import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';
import {
  Role,
  OrganizationInvitationStatus,
} from '@energyweb/origin-backend-core';

describe('Organization members page', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  const member = generateNewUser();
  const deviceManager = generateNewUser();
  const admin = generateNewUser();
  const userThatRejected = generateNewUser();

  before(() => {
    cy.apiRegisterAndApproveUser(testUser);
    cy.apiRegisterAndApproveOrg(testUser, testOrg);
    cy.apiRegisterUser(member);
    cy.apiRegisterUser(deviceManager);
    cy.apiRegisterUser(admin);
    cy.apiRegisterUser(userThatRejected);

    cy.apiSendInvitation(testUser, member.email, Role.OrganizationUser);
    cy.apiSendInvitation(
      testUser,
      deviceManager.email,
      Role.OrganizationDeviceManager
    );
    cy.apiSendInvitation(testUser, admin.email, Role.OrganizationAdmin);
    cy.apiSendInvitation(
      testUser,
      userThatRejected.email,
      Role.OrganizationAdmin
    );

    cy.apiUserProceedInvitation(member, OrganizationInvitationStatus.Accepted);
    cy.apiUserProceedInvitation(
      deviceManager,
      OrganizationInvitationStatus.Accepted
    );
    cy.apiUserProceedInvitation(admin, OrganizationInvitationStatus.Accepted);
    cy.apiUserProceedInvitation(
      userThatRejected,
      OrganizationInvitationStatus.Rejected
    );

    cy.apiLoginUser(testUser);
    cy.visit('/');
    cy.dataCy('organizationMenu').click();
    cy.navigateMenu('organizationMembers');
    cy.url().should('include', 'members');
  });

  it('should show organization members page in table', () => {
    cy.contains('tr', testUser.email).contains('td', 'Admin');
    cy.contains('tr', member.email).contains('td', 'Member');
    cy.contains('tr', deviceManager.email).contains('td', 'Device Manager');
    cy.contains('tr', admin.email).contains('td', 'Admin');
    cy.contains(userThatRejected.email).should('not.exist');
    cy.contains('1–4 of 4');
  });

  it('should remove invited admin', () => {
    cy.contains('tr', admin.email)
      .find('td')
      .last()
      .within(() => {
        cy.dataCy('moreIcon').trigger('mouseover');
      });
    cy.dataCy('removeMember').filter(':visible').click();
    cy.notification('User removed');
    cy.contains('tr', admin.email).should('not.exist');
    cy.contains('1–3 of 3');
  });

  it('should change device manager role to admin', () => {
    cy.contains('tr', deviceManager.email)
      .find('td')
      .last()
      .within(() => {
        cy.dataCy('moreIcon').trigger('mouseover');
      });
    cy.dataCy('editRole').filter(':visible').click();
    cy.contains(
      `Change role for ${deviceManager.firstName} ${deviceManager.lastName}`
    );
    cy.contains('Device Manager');
    cy.contains('button', 'Change').should('be.disabled');

    cy.selectValueByIndex('changeRoleSelect', '1');
    cy.contains('Admin');
    cy.contains('button', 'Change').should('not.be.disabled').click();

    cy.notification('Member role updated');

    cy.contains('tr', testUser.email).contains('td', 'Admin');
    cy.contains('tr', member.email).contains('td', 'Member');
    cy.contains('tr', deviceManager.email).contains('td', 'Admin');
    cy.contains('1–3 of 3');
  });

  it('should not allow remove last person in organization', () => {
    cy.apiLoginUser(testUser);
    cy.visit('/organization/members');

    cy.contains('tr', deviceManager.email)
      .find('td')
      .last()
      .within(() => {
        cy.dataCy('moreIcon').trigger('mouseover');
      });

    cy.dataCy('removeMember')
      .filter(':visible')
      .click({ waitForAnimations: true });
    cy.notification('User removed');

    cy.contains('tr', member.email)
      .find('td')
      .last()
      .within(() => {
        cy.dataCy('moreIcon').trigger('mouseover');
      });
    cy.dataCy('removeMember')
      .filter(':visible')
      .click({ waitForAnimations: true });
    cy.notification('User removed');

    cy.contains('tr', testUser.email)
      .find('td')
      .last()
      .within(() => {
        cy.dataCy('moreIcon').trigger('mouseover');
      });
    cy.dataCy('removeMember')
      .filter(':visible')
      .click({ waitForAnimations: true });
    cy.notification("You can't remove yourself from organization");
    cy.contains('tr', testUser.email).contains('td', 'Admin');
    cy.contains('1–1 of 1');
  });
});
