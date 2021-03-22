/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewUser } from '../../utils/generateMockData';

describe('Active user profile user info block interactions', () => {
    const testUser = generateNewUser();
    const editText = 'edited';
    const editNumbers = '1111';

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/account/user-profile');
    });

    it('should not show pending badge', () => {
        cy.contains(`${testUser.firstName} ${testUser.lastName}`);
        cy.dataCy('user-pending-badge').should('not.exist');
    });

    it('should show pop-ups for blockchain addresses fields', () => {
        cy.dataCy('exchange-address-info-icon').trigger('mouseover');
        cy.contains('You need it to trade certificates on the exchange');

        cy.dataCy('blockchain-address-info-icon').trigger('mouseover');
        cy.contains('A connected user blockchain address is required to withdraw');
    });

    it('should validate user info fields as required', () => {
        cy.dataCy('info-edit-button').click();
        cy.filledInputRequired('first-name', 'last-name');
        cy.filledInputRequired('last-name', 'telephone');
        cy.filledInputRequired('telephone', 'first-name');
    });

    it('should revert changes to user info inputs after cancel button is clicked', () => {
        const { firstName, lastName, telephone } = testUser;

        cy.dataCy('info-edit-button').click();
        cy.dataCy('first-name').type(editText);
        cy.dataCy('first-name')
            .find('input')
            .should('have.value', firstName + editText);
        cy.dataCy('info-save-button').should('not.be.disabled');
        cy.dataCy('info-cancel-button').click();
        cy.dataCy('first-name').find('input').should('have.value', firstName);

        cy.dataCy('info-edit-button').click();
        cy.dataCy('last-name').type(editText);
        cy.dataCy('last-name')
            .find('input')
            .should('have.value', lastName + editText);
        cy.dataCy('info-save-button').should('not.be.disabled');
        cy.dataCy('info-cancel-button').click();
        cy.dataCy('last-name').find('input').should('have.value', lastName);

        cy.dataCy('info-edit-button').click();
        cy.dataCy('telephone').type(editNumbers);
        cy.dataCy('telephone')
            .find('input')
            .should('have.value', telephone + editNumbers);
        cy.dataCy('info-save-button').should('not.be.disabled');
        cy.dataCy('info-cancel-button').click();
        cy.dataCy('telephone').find('input').should('have.value', telephone);
    });

    it('should allow to change user info', () => {
        const { firstName, lastName, telephone } = testUser;
        const newFirstName = firstName + editText;
        const newLastName = lastName + editText;
        cy.dataCy('info-edit-button').click();
        cy.dataCy('first-name').type(editText);
        cy.dataCy('last-name').type(editText);
        cy.dataCy('telephone').type(editNumbers);
        cy.dataCy('first-name').find('input').should('have.value', newFirstName);
        cy.dataCy('last-name').find('input').should('have.value', newLastName);
        cy.dataCy('telephone')
            .find('input')
            .should('have.value', telephone + editNumbers);
        cy.dataCy('info-save-button').should('not.be.disabled');

        cy.dataCy('info-save-button').click();
        cy.notification('User profile updated');
        cy.contains(`${newFirstName} ${newLastName}`);
    });
});
