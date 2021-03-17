/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register new organization', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const registerUrl = '/organization/organization-register';
    const myOrgUrl = '/organization/my-organization';

    const companyProof = 'organization-upload-proof';
    const signatoryId = 'signatory-upload-id';

    const orgCountry = 'organization-country';
    const orgBusinessType = 'organization-business-type';
    const signatoryCountry = 'organization-signatory-country';

    before(() => {
        cy.apiRegisterUser(testUser);
        cy.apiLoginUser(testUser);
        cy.visit('/');
        cy.dataCy('organizations-menu').click();
        cy.dataCy('organization-register').click();
        cy.url().should('include', registerUrl);
    });

    it('should allow to create new organization using register form', () => {
        cy.fillOrgRegisterForm(testOrg);
        cy.dataCy('register-submit-button').should('be.disabled');

        cy.dataCy(orgCountry).click();
        cy.contains('Austria').click();
        cy.dataCy(orgBusinessType).click();
        cy.contains('incorporated').click();
        cy.dataCy(signatoryCountry).click();
        cy.contains('Andorra').click();
        cy.dataCy('register-submit-button').should('be.disabled');

        cy.attachDocument(companyProof);
        cy.attachDocument(signatoryId);
        cy.dataCy('register-submit-button').should('not.be.disabled').click();

        cy.notification('Organization registered');
    });

    it('should show Role Changed Modal', () => {
        cy.contains(`Successfully joined ${testOrg.name}`);
        cy.contains('As an Organization Admin you have permission');
        cy.contains('You can also perform all actions of a device manage');
        cy.contains(
            'You can also perform all actions that a regular organization member can perform'
        );
        cy.get('button').contains('Ok').click();
    });

    it('should show Register I-Rec Modal', () => {
        cy.contains('Thank you for registering an organization on the marketplace!');
        cy.get('button').contains('Register new I-REC account');
        cy.get('button').contains('Not now').click();
    });

    it('should show Modal with info about admin approval', () => {
        cy.contains('Thank you for registering!');
        cy.contains('Your registration is reviewed by the platform administrator');
        cy.get('button').contains('Ok').click();
        cy.url().should('include', 'devices');
    });

    it('should show org pending badge and org name on the Sidebar', () => {
        cy.contains(testOrg.name);
        cy.dataCy('organization-pending-badge').should(
            'have.css',
            'background-color',
            'rgb(255, 215, 0)'
        );
        cy.dataCy('organization-pending-badge').trigger('mouseover');
        cy.contains('Your organization status is pending');
    });

    it('should show uploaded docs in My Organization view', () => {
        cy.dataCy('organizations-menu').click();
        cy.dataCy('my-organization').click();
        cy.url().should('include', myOrgUrl);

        cy.dataCy('company-proof-doc').find('span').should('have.text', 'Company Proof');
        cy.dataCy('signatory-id-doc').find('span').should('have.text', 'Signatory ID');
    });
});
