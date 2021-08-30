/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';
import { Role, OrganizationInvitationStatus } from '@energyweb/origin-backend-core';

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
        cy.apiSendInvitation(testUser, deviceManager.email, Role.OrganizationDeviceManager);
        cy.apiSendInvitation(testUser, admin.email, Role.OrganizationAdmin);
        cy.apiSendInvitation(testUser, userThatRejected.email, Role.OrganizationAdmin);

        cy.apiUserProceedInvitation(member, OrganizationInvitationStatus.Accepted);
        cy.apiUserProceedInvitation(deviceManager, OrganizationInvitationStatus.Accepted);
        cy.apiUserProceedInvitation(admin, OrganizationInvitationStatus.Accepted);
        cy.apiUserProceedInvitation(userThatRejected, OrganizationInvitationStatus.Rejected);

        cy.apiLoginUser(testUser);
        cy.visit('/');
        cy.dataCy('organizations-menu').click();
        cy.dataCy('organization-users').click();
        cy.url().should('include', 'organization-users');
    });

    it('should show organization members page in table', () => {
        cy.contains('tr', testUser.email).contains('td', 'Admin');
        cy.contains('tr', member.email).contains('td', 'Member');
        cy.contains('tr', deviceManager.email).contains('td', 'Device Manager');
        cy.contains('tr', admin.email).contains('td', 'Admin');
        cy.contains(userThatRejected.email).should('not.exist');
        cy.contains('1-4 of 4');
    });

    it('should remove invited admin', () => {
        cy.contains('tr', admin.email).find('td').last().click();
        cy.dataCy('remove-user-icon').filter(':visible').click();
        cy.notification('User removed');
        cy.get('.toast').click();
        cy.contains('tr', admin.email).should('not.exist');
        cy.contains('1-3 of 3');
        cy.wait(500);
    });

    it('should change device manager role to admin', () => {
        cy.contains('tr', deviceManager.email).find('td').last().click();
        cy.dataCy('edit-user-icon').filter(':visible').click();
        cy.contains(`Change role for ${deviceManager.firstName} ${deviceManager.lastName}`);
        cy.contains('Device Manager');
        cy.dataCy('change-role-button').should('be.disabled');

        cy.dataCy('new-role-selector').click();
        cy.get('[data-value="1"]').click();
        cy.contains('Admin');
        cy.dataCy('change-role-button').click();

        cy.notification('User role updated');
        cy.get('.toast').click();
        cy.contains('tr', testUser.email).contains('td', 'Admin');
        cy.contains('tr', member.email).contains('td', 'Member');
        cy.contains('tr', deviceManager.email).contains('td', 'Admin');
        cy.contains('1-3 of 3');
        cy.wait(750);
    });

    it('should not allow remove last person in organization', () => {
        cy.contains('tr', deviceManager.email).find('td').last().click();
        cy.dataCy('remove-user-icon').filter(':visible').click();
        cy.get('.toast').click();
        cy.wait(750);
        cy.contains('tr', member.email).find('td').last().click();
        cy.dataCy('remove-user-icon').filter(':visible').click();
        cy.get('.toast').click();
        cy.wait(750);

        cy.contains('tr', testUser.email).find('td').last().click();
        cy.dataCy('remove-user-icon').filter(':visible').click();
        cy.notification("You can't remove yourself from organization");
        cy.contains('tr', testUser.email).contains('td', 'Admin');
        cy.contains('1-1 of 1');
    });
});
