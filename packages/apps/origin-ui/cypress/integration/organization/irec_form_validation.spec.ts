/// <reference types="cypress" />
/// <reference types="../../support" />
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('I-Rec register form validation', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const testWord = 'test';

    const registrationYearCy = 'year-registration';
    const websiteCy = 'org-website';
    const mainBusinessCy = 'main-business';
    const ceoNameCy = 'ceo-name';
    const ceoPassportNumberCy = 'ceo-passport';
    const balanceSheetTotalCy = 'last-balance';
    const primaryContactOrganizationNameCy = 'primary-contact-org-name';
    const primaryContactOrganizationAddressCy = 'primary-contact-org-address';
    const primaryContactOrganizationPostalCodeCy = 'primary-contact-org-postal-code';
    const primaryContactNameCy = 'primary-contact-person-name';
    const primaryContactEmailCy = 'primary-contact-person-email';
    const primaryContactPhoneNumberCy = 'primary-contact-person-phone';
    const primaryContactFaxCy = 'primary-contact-person-fax';
    const leadUserFirstNameCy = 'lead-user-first-name';
    const leadUserLastNameCy = 'lead-user-last-name';
    const leadUserEmailCy = 'lead-user-email';
    const leadUserPhoneNumberCy = 'lead-user-phone';
    const leadUserFaxCy = 'lead-user-fax';

    before(() => {
        cy.apiRegisterUser(testUser);
        cy.apiRegisterOrg(testUser, testOrg);
        cy.visit('/');
    });

    it('should validate form inputs', () => {
        cy.dataCy('organizations-menu').click();
        cy.dataCy('register-irec').click();

        cy.inputRequired(registrationYearCy, websiteCy);
        cy.inputRequired(websiteCy, mainBusinessCy);
        cy.inputRequired(mainBusinessCy, ceoNameCy);
        cy.inputRequired(ceoNameCy, ceoPassportNumberCy);
        cy.inputRequired(ceoPassportNumberCy, balanceSheetTotalCy);
        cy.inputRequired(balanceSheetTotalCy, primaryContactOrganizationNameCy);
        cy.inputRequired(primaryContactOrganizationNameCy, primaryContactOrganizationAddressCy);
        cy.inputRequired(
            primaryContactOrganizationAddressCy,
            primaryContactOrganizationPostalCodeCy
        );
        cy.inputRequired(primaryContactOrganizationPostalCodeCy, primaryContactNameCy);
        cy.inputRequired(primaryContactNameCy, primaryContactEmailCy);
        cy.inputRequired(primaryContactEmailCy, primaryContactPhoneNumberCy);
        cy.inputRequired(primaryContactPhoneNumberCy, primaryContactFaxCy);
        cy.inputRequired(primaryContactFaxCy, leadUserFirstNameCy);
        cy.inputRequired(leadUserFirstNameCy, leadUserLastNameCy);
        cy.inputRequired(leadUserLastNameCy, leadUserEmailCy);
        cy.inputRequired(leadUserEmailCy, leadUserPhoneNumberCy);
        cy.inputRequired(leadUserPhoneNumberCy, leadUserFaxCy);
        cy.inputRequired(leadUserFaxCy, leadUserPhoneNumberCy);

        cy.dataCy(websiteCy).type(testWord);
        cy.contains('Organization Website must be a valid URL');

        cy.dataCy(primaryContactEmailCy).type(testWord);
        cy.contains('Contact person email must be a valid email');

        cy.dataCy(leadUserEmailCy).type(testWord);
        cy.contains('Email must be a valid email');
    });
});
