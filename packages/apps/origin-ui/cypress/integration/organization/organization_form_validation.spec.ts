/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register organization form validation', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const registerUrl = '/organization/organization-register';

    const orgName = 'organization-name';
    const orgAddress = 'organization-address';
    const orgZipcode = 'organization-zipcode';
    const orgCity = 'organization-city';
    const orgTradeReg = 'organization-trade-registry';
    const orgVat = 'organization-vat';
    const signName = 'organization-signatory-name';
    const signAddress = 'organization-signatory-address';
    const signZipcode = 'organization-signatory-zipcode';
    const signCity = 'organization-signatory-city';
    const signEmail = 'organization-signatory-email';
    const signPhone = 'organization-signatory-phone';

    const companyProof = 'organization-upload-proof';
    const signatoryId = 'signatory-upload-id';

    const orgCountry = 'organization-country';
    const orgBusinessType = 'organization-business-type';
    const signatoryCountry = 'organization-signatory-country';

    before(() => {
        cy.apiRegisterUser(testUser);
        cy.apiLoginUser(testUser);
        cy.visit('/');
    });

    beforeEach(() => {
        cy.dataCy('organizations-menu').click();
        cy.dataCy('organization-register').click();
        cy.url().should('include', registerUrl);
    });

    it('should validate input fields', () => {
        cy.inputRequired(orgName, orgAddress);
        cy.inputRequired(orgAddress, orgZipcode);
        cy.inputRequired(orgZipcode, orgCity);
        cy.inputRequired(orgCity, orgTradeReg);
        cy.inputRequired(orgTradeReg, orgVat);
        cy.inputRequired(orgVat, signName);
        cy.inputRequired(signName, signAddress);
        cy.inputRequired(signAddress, signZipcode);
        cy.inputRequired(signZipcode, signCity);
        cy.inputRequired(signCity, signEmail);
        cy.inputRequired(signEmail, signPhone);
        cy.inputRequired(signPhone, signEmail);

        cy.dataCy(signEmail).type('not_an_email');
        cy.contains('must be a valid email');
    });

    it('should not allow to register company without countries, business type or docs', () => {
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
        cy.dataCy('register-submit-button').should('not.be.disabled');
    });
});
