/// <reference types="cypress" />
/// <reference types="../../support" />
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
        cy.apiSendInvitation(orgOwner, deviceManager.email, Role.OrganizationDeviceManager);
        cy.apiSendInvitation(orgOwner, admin.email, Role.OrganizationAdmin);
    });

    it('should show modal and allow to skip it', () => {
        cy.visit('/user-login');
        const { email, password } = memberAccept;
        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Invitation to join the marketplace');
        cy.contains(orgOwner.firstName);
        cy.contains(orgOwner.lastName);
        cy.contains(testOrg.name);
        cy.dataCy('invitations-later-button').click();
        cy.notification('You can find this invitation on the Organizations tab');
        cy.get('.toast').click();

        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();
        cy.url().should('include', '/devices/production');
        cy.contains(testOrg.name).should('not.exist');
    });

    it('should allow to accept invitation through invitations table', () => {
        cy.dataCy('organizations-menu').click();
        cy.url().should('include', 'organization-invitations');

        cy.contains('Received');
        cy.contains('tr', memberAccept.email).contains('td', 'Pending');
        cy.contains('tr', memberAccept.email).find('td').last().click();
        cy.dataCy('accept-invitation-icon').filter(':visible').click();

        cy.contains(`Successfully joined ${testOrg.name}`);
        cy.contains('As a member you can');
        cy.contains('Place orders on the exchange');
        cy.contains('button', 'Ok').click();
        cy.url().should('include', 'devices/production');
        cy.notification('Invitation accepted');
        cy.get('.toast').click();
        cy.contains(testOrg.name);
        cy.dataCy('organizations-menu').should('not.exist');

        cy.clearLocalStorage();
    });

    it('should allow to decline invitation through invitations table', () => {
        cy.visit('/user-login');
        const { email, password } = memberReject;
        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Invitation to join the marketplace');
        cy.contains(orgOwner.firstName);
        cy.contains(orgOwner.lastName);
        cy.contains(testOrg.name);
        cy.dataCy('invitations-later-button').click();
        cy.notification('You can find this invitation on the Organizations tab');
        cy.get('.toast').click();

        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();
        cy.dataCy('organizations-menu').click();
        cy.url().should('include', 'organization-invitations');

        cy.contains('tr', memberReject.email).find('td').last().click();
        cy.dataCy('decline-invitation-icon').filter(':visible').click();
        cy.wait(50);
        cy.notification('Invitation rejected');
        cy.contains('tr', memberReject.email).contains('td', 'Rejected');
        cy.dataCy('organizations-menu');

        cy.clearLocalStorage();
    });

    it('should allow to accept invitation through modal window', () => {
        cy.visit('/user-login');
        const { email, password } = deviceManager;
        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Invitation to join the marketplace');
        cy.contains(orgOwner.firstName);
        cy.contains(orgOwner.lastName);
        cy.contains(testOrg.name);
        cy.dataCy('invitations-accept-button').click();

        cy.contains(`Successfully joined ${testOrg.name}`);
        cy.contains('As a Device Manager you have permission to');
        cy.contains('Register devices and device groups');
        cy.contains('Place orders on the exchange');
        cy.contains('button', 'Ok').click();

        cy.contains('Connect Blockchain Address');
        cy.contains('button', 'Maybe Later').click();

        cy.url().should('include', 'devices/production');
        cy.contains(testOrg.name);
        cy.dataCy('organizations-menu').should('not.exist');

        cy.clearLocalStorage();
    });

    it('should allow to decline invitation through modal window', () => {
        cy.visit('/user-login');
        const { email, password } = admin;
        cy.fillUserLogin({ email, password });
        cy.dataCy('login-button').click();

        cy.contains('Invitation to join the marketplace');
        cy.contains(orgOwner.firstName);
        cy.contains(orgOwner.lastName);
        cy.contains(testOrg.name);
        cy.dataCy('invitations-decline-button').click();

        cy.contains('Thank you for registering as a user on the marketplace');
        cy.get('button').contains('Not now').click();
        cy.notification('Invitation rejected');

        cy.url().should('include', 'devices/production');
        cy.contains(testOrg.name).should('not.exist');
        cy.dataCy('organizations-menu');
    });
});
