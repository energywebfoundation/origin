/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';
import { OrganizationInvitationStatus } from '@energyweb/origin-backend-core';

describe('Organization invite form and invitations table', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const inviteTab = 'organization-invite';
    const invitationsTab = 'organization-invitations';

    const inviteEmailCy = 'invitation-email';
    const inviteRoleCy = 'invitation-role';
    const inviteButtonCy = 'invitation-submit';

    const member = generateNewUser();
    const deviceManager = generateNewUser();
    const admin = generateNewUser();

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);
        cy.apiLoginUser(testUser);
        cy.visit('/');

        cy.dataCy('organizations-menu').click();
        cy.dataCy(inviteTab).click();
        cy.url().should('include', inviteTab);
    });

    it('should allow to send invitation for member', () => {
        cy.dataCy(inviteEmailCy).type(member.email);
        cy.contains('Member');
        cy.dataCy(inviteButtonCy).click();
        cy.notification('Invitation sent');
        cy.get('.toast').click();
        // testing formReset
        cy.dataCy(inviteEmailCy).should('have.value', '');
    });

    it('should allow to send invitation for device manager', () => {
        cy.dataCy(inviteEmailCy).type(deviceManager.email);
        cy.dataCy(inviteRoleCy).click();
        cy.get('[data-value="2"]').click();
        cy.dataCy(inviteButtonCy).click();
        cy.notification('Invitation sent');
        cy.get('.toast').click();
        // testing formReset
        cy.dataCy(inviteRoleCy).find('input').should('have.value', '4');
    });

    it('should allow to send invitation for admin', () => {
        cy.dataCy(inviteEmailCy).type(admin.email);
        cy.dataCy(inviteRoleCy).click();
        cy.get('[data-value="1"]').click();
        cy.dataCy(inviteButtonCy).click();
        cy.notification('Invitation sent');
        cy.get('.toast').click();
    });

    it('should not allow to send invitation to already invited user', () => {
        cy.dataCy(inviteEmailCy).type(member.email);
        cy.contains('Member');
        cy.dataCy(inviteButtonCy).click();
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
        cy.visit('/');
        cy.dataCy('organizations-menu').click();
        cy.dataCy(inviteTab).click();
        cy.url().should('include', inviteTab);

        cy.dataCy(inviteEmailCy).type(anotherTestUser.email);
        cy.dataCy(inviteRoleCy).click();
        cy.get('[data-value="1"]').click();
        cy.dataCy(inviteButtonCy).click();
        cy.notification('Could not invite user to organization');
    });

    it('should show invitation with pending status', () => {
        cy.dataCy(invitationsTab).click();
        cy.url().should('include', invitationsTab);
        cy.contains('tr', member.email).contains('td', OrganizationInvitationStatus.Pending);
        cy.contains('tr', deviceManager.email).contains('td', OrganizationInvitationStatus.Pending);
        cy.contains('tr', admin.email).contains('td', OrganizationInvitationStatus.Pending);
        cy.contains('1-3 of 3');
    });

    it('should show invitation with approved status', () => {
        cy.clearLocalStorage();
        cy.apiRegisterUser(member);
        cy.apiUserProceedInvitation(member, OrganizationInvitationStatus.Accepted);

        cy.apiLoginUser(testUser);
        cy.visit('/');
        cy.dataCy('organizations-menu').click();
        cy.dataCy(invitationsTab).click();
        cy.url().should('include', invitationsTab);

        cy.contains('tr', member.email).contains('td', OrganizationInvitationStatus.Accepted);
        cy.contains('tr', deviceManager.email).contains('td', OrganizationInvitationStatus.Pending);
        cy.contains('tr', admin.email).contains('td', OrganizationInvitationStatus.Pending);
        cy.contains('1-3 of 3');
    });

    it('should show invitation with rejected status', () => {
        cy.clearLocalStorage();
        cy.apiRegisterUser(deviceManager);
        cy.apiUserProceedInvitation(deviceManager, OrganizationInvitationStatus.Rejected);

        cy.apiLoginUser(testUser);
        cy.visit('/');
        cy.dataCy('organizations-menu').click();
        cy.dataCy(invitationsTab).click();
        cy.url().should('include', invitationsTab);

        cy.contains('tr', member.email).contains('td', OrganizationInvitationStatus.Accepted);
        cy.contains('tr', deviceManager.email).contains(
            'td',
            OrganizationInvitationStatus.Rejected
        );
        cy.contains('tr', admin.email).contains('td', OrganizationInvitationStatus.Pending);
        cy.contains('1-3 of 3');
    });
});
