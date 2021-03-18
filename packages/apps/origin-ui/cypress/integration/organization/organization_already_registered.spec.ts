/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register organization with taken name', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const registerUrl = '/organization/organization-register';

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

    it('should not allow to register organization with taken name', () => {
        const orgWithDuplicateName = {
            ...testOrg,
            name: 'Device Manager Organization'
        };

        cy.fillOrgRegisterForm(orgWithDuplicateName);

        cy.dataCy(orgCountry).click();
        cy.contains('Austria').click();
        cy.dataCy(orgBusinessType).click();
        cy.contains('incorporated').click();
        cy.dataCy(signatoryCountry).click();
        cy.contains('Andorra').click();

        cy.attachDocument(companyProof);
        cy.attachDocument(signatoryId);
        cy.dataCy('register-submit-button').click();

        cy.notification(`Organization name "${orgWithDuplicateName.name}" is already taken`);
        cy.contains('Sorry but this organization could not be registered.');
        cy.contains('Ok').click();
        cy.url().should('include', registerUrl);
    });
});
