/// <reference types="cypress" />
/// <reference types="../../support" />
import * as iRecOrgTestData from '../../fixtures/testIRecOrg.json';
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('I-REC organization registration', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const {
        registrationYear,
        shareholders,
        website,
        mainBusiness,
        ceoName,
        ceoPassportNumber,
        balanceSheetTotal,
        primaryContactOrganizationName,
        primaryContactOrganizationAddress,
        primaryContactOrganizationPostalCode,
        subsidiaries,
        primaryContactName,
        primaryContactEmail,
        primaryContactPhoneNumber,
        primaryContactFax,
        leadUserFirstName,
        leadUserLastName,
        leadUserEmail,
        leadUserPhoneNumber,
        leadUserFax
    } = iRecOrgTestData;

    const accountTypeCy = 'irec-account-type';
    const headquarterCountryCy = 'org-headquaters-country';
    const registrationYearCy = 'year-registration';
    const employeesNumberCy = 'number-of-employees';
    const shareholdersCy = 'shareholders-names';
    const websiteCy = 'org-website';
    const activeCountriesCy = 'active-countries';
    const mainBusinessCy = 'main-business';
    const ceoNameCy = 'ceo-name';
    const ceoPassportNumberCy = 'ceo-passport';
    const balanceSheetTotalCy = 'last-balance';
    const primaryContactOrganizationNameCy = 'primary-contact-org-name';
    const primaryContactOrganizationAddressCy = 'primary-contact-org-address';
    const primaryContactOrganizationPostalCodeCy = 'primary-contact-org-postal-code';
    const primaryContactOrganizationCountryCy = 'primary-contact-org-country';
    const subsidiariesCy = 'primary-contact-existing-irec';
    const primaryContactNameCy = 'primary-contact-person-name';
    const primaryContactEmailCy = 'primary-contact-person-email';
    const primaryContactPhoneNumberCy = 'primary-contact-person-phone';
    const primaryContactFaxCy = 'primary-contact-person-fax';
    const leadUserTitleCy = 'lead-user-title';
    const leadUserFirstNameCy = 'lead-user-first-name';
    const leadUserLastNameCy = 'lead-user-last-name';
    const leadUserEmailCy = 'lead-user-email';
    const leadUserPhoneNumberCy = 'lead-user-phone';
    const leadUserFaxCy = 'lead-user-fax';

    before(() => {
        cy.apiRegisterUser(testUser);
        cy.apiRegisterOrg(testUser, testOrg);
        cy.visit('/');
        cy.apiLoginUser(testUser);
        cy.dataCy('organizations-menu').click();
        cy.dataCy('register-irec').click();
        cy.url().should('include', 'register-irec');
    });

    it('should fill all form inputs', () => {
        cy.dataCy(registrationYearCy).type(registrationYear.toString());
        cy.dataCy(shareholdersCy).type(shareholders);
        cy.dataCy(websiteCy).type(website);
        cy.dataCy(mainBusinessCy).type(mainBusiness);
        cy.dataCy(ceoNameCy).type(ceoName);
        cy.dataCy(ceoPassportNumberCy).type(ceoPassportNumber);
        cy.dataCy(balanceSheetTotalCy).type(balanceSheetTotal);
        cy.dataCy(primaryContactOrganizationNameCy).type(primaryContactOrganizationName);
        cy.dataCy(primaryContactOrganizationAddressCy).type(primaryContactOrganizationAddress);
        cy.dataCy(primaryContactOrganizationPostalCodeCy).type(
            primaryContactOrganizationPostalCode
        );
        cy.dataCy(subsidiariesCy).type(subsidiaries);
        cy.dataCy(primaryContactNameCy).type(primaryContactName);
        cy.dataCy(primaryContactEmailCy).type(primaryContactEmail);
        cy.dataCy(primaryContactPhoneNumberCy).type(primaryContactPhoneNumber);
        cy.dataCy(primaryContactFaxCy).type(primaryContactFax);
        cy.dataCy(leadUserFirstNameCy).type(leadUserFirstName);
        cy.dataCy(leadUserLastNameCy).type(leadUserLastName);
        cy.dataCy(leadUserEmailCy).type(leadUserEmail);
        cy.dataCy(leadUserPhoneNumberCy).type(leadUserPhoneNumber);
        cy.dataCy(leadUserFaxCy).type(leadUserFax);

        cy.dataCy('register-irec-button').should('be.disabled');
    });

    it('should select options for all selectors in the form', () => {
        cy.dataCy(accountTypeCy).click();
        cy.contains('Registrant and Participant').click();

        cy.dataCy(headquarterCountryCy).click();
        cy.contains('Austria').click();

        cy.dataCy(employeesNumberCy).click();
        cy.contains('50-100').click();

        cy.dataCy(activeCountriesCy).click();
        cy.contains('Algeria').click();
        cy.dataCy(activeCountriesCy).click();
        cy.contains('Andorra').click();

        cy.dataCy(primaryContactOrganizationCountryCy).click();
        cy.contains('Austria').click();
        cy.dataCy('register-irec-button').should('be.disabled');

        cy.dataCy(leadUserTitleCy).click();
        cy.contains('Mr').click();
    });

    it('should register organization and show notification and modals', () => {
        cy.dataCy('register-irec-button').should('not.be.disabled');
        cy.dataCy('register-irec-button').click();

        cy.contains('Thank you for registering an I-REC account!');
        cy.contains('button', 'Ok').click();

        cy.notification('Organization registered');
        cy.wait(500);
    });

    it('should redirect to default page after clicking Ok', () => {
        cy.contains('button', 'Ok').click();
        cy.url().should('include', 'devices/production');
    });

    it('should display appropriate I-REC data in My Organization view', () => {
        cy.dataCy('organizations-menu').click();
        cy.dataCy('my-organization').click();
        cy.contains('div', 'I-REC Information');

        cy.inputHasValue(accountTypeCy, 'Both Registrant and Participant Account');
        cy.inputHasValue(headquarterCountryCy, 'Austria');
        cy.inputHasValue(registrationYearCy, registrationYear.toString());
        cy.inputHasValue(employeesNumberCy, '50-100');
        cy.inputHasValue(shareholdersCy, shareholders);
        cy.inputHasValue(websiteCy, website);
        cy.inputHasValue(activeCountriesCy, 'Algeria, Andorra');
        cy.inputHasValue(mainBusinessCy, mainBusiness);
        cy.inputHasValue(ceoNameCy, ceoName);
        cy.inputHasValue(ceoPassportNumberCy, ceoPassportNumber);
        cy.inputHasValue(balanceSheetTotalCy, balanceSheetTotal);
        cy.inputHasValue(primaryContactOrganizationNameCy, primaryContactOrganizationName);
        cy.inputHasValue(primaryContactOrganizationAddressCy, primaryContactOrganizationAddress);
        cy.inputHasValue(
            primaryContactOrganizationPostalCodeCy,
            primaryContactOrganizationPostalCode
        );
        cy.inputHasValue(primaryContactOrganizationCountryCy, 'Austria');
        cy.inputHasValue(subsidiariesCy, subsidiaries);
        cy.inputHasValue(primaryContactNameCy, primaryContactName);
        cy.inputHasValue(primaryContactEmailCy, primaryContactEmail);
        cy.inputHasValue(primaryContactPhoneNumberCy, primaryContactPhoneNumber);
        cy.inputHasValue(primaryContactFaxCy, primaryContactFax);
        cy.inputHasValue(leadUserTitleCy, 'Mr');
        cy.inputHasValue(leadUserFirstNameCy, leadUserFirstName);
        cy.inputHasValue(leadUserLastNameCy, leadUserLastName);
        cy.inputHasValue(leadUserEmailCy, leadUserEmail);
        cy.inputHasValue(leadUserPhoneNumberCy, leadUserPhoneNumber);
        cy.inputHasValue(leadUserFaxCy, leadUserFax);
    });
});
