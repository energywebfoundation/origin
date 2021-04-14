/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Devices for registered user', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/');
    });

    it('should show requirements in My Devices and Register Device', () => {
        cy.visit('/devices/owned');
        cy.url().should('include', 'devices/owned');

        cy.contains('You need to be a logged in user.');
        cy.contains('User has to be approved by the platform admin.');
        cy.contains('The user should be a part of an approved organization.');
        cy.contains(
            'The organization has to have a blockchain exchange deposit address attached to the account.'
        );

        cy.visit('/devices/add');
        cy.url().should('include', 'devices/add');

        cy.contains('You need to be a logged in user.').should('exist');
        cy.contains('User has to be approved by the platform admin.').should('exist');
        cy.contains('The user should be a part of an approved organization.').should('exist');
        cy.contains(
            'The organization has to have a blockchain exchange deposit address attached to the account.'
        ).should('exist');
    });
});
