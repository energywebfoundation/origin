/// <reference types="cypress" />

import { Countries } from '@energyweb/utils-general';
import testIrecOrg from '../../fixtures/testIRecOrg.json';
import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('I-REC organization registration', () => {
  const testUser = generateNewUser();
  const testOrg = generateNewOrg(testUser);

  before(() => {
    cy.apiRegisterUser(testUser);
    cy.apiRegisterOrg(testUser, testOrg);
    cy.visit('/');
    cy.apiLoginUser(testUser);
    cy.visit('/organization/register-irec');
  });

  it('should fill all form inputs', () => {
    cy.fillIRecRegistrationInfo(testIrecOrg);
    cy.nextStep();
    cy.fillIrecPrimaryContactDetails(testIrecOrg);
    cy.nextStep();
    cy.fillIrecLeadUserDetails(testIrecOrg);
  });

  it('should register organization and show notification and modals', () => {
    cy.submitForm();
    cy.contains('Thank you for registering an I-REC account!');
    cy.get('button').contains('Ok').click();

    cy.notification('Organization registered');

    cy.contains('Thank you for registering!');
    cy.wait(500);
    cy.get('button').contains('Ok').click();
  });

  it('should display appropriate I-REC data in My Organization view', () => {
    cy.inputHasValue(
      'registrationInfoFormTitle',
      'Both Registrant and Participant Account'
    );
    cy.inputHasValue(
      'orgHeadquartersCountry',
      Countries.find(
        (country) => country.code === testIrecOrg.headquarterCountry
      ).name
    );
    cy.inputHasValue('yearOfregisterIRec', testIrecOrg.registrationYear);
    cy.inputHasValue('numberOfEmployees', testIrecOrg.employeesNumber);
    cy.inputHasValue('shareholderNames', testIrecOrg.shareholders);
    cy.inputHasValue('orgWebsite', testIrecOrg.website);
    cy.inputHasValue(
      'activeCountries',
      testIrecOrg.activeCountries
        .map(
          (activeCountry) =>
            Countries.find((country) => country.code === activeCountry).name
        )
        .join(', ')
    );
    cy.inputHasValue('mainBusiness', testIrecOrg.mainBusiness);
    cy.inputHasValue('ceoName', testIrecOrg.ceoName);
    cy.inputHasValue('ceoPassport', testIrecOrg.ceoPassportNumber);
    cy.inputHasValue('balanceSheetTotal', testIrecOrg.balanceSheetTotal);
    cy.inputHasValue(
      'primaryContactOrgName',
      testIrecOrg.primaryContactOrganizationName
    );
    cy.inputHasValue(
      'primaryContactOrgAddress',
      testIrecOrg.primaryContactOrganizationAddress
    );
    cy.inputHasValue(
      'primaryContactOrgPostalCode',
      testIrecOrg.primaryContactOrganizationPostalCode
    );
    cy.inputHasValue(
      'primaryContactOrgCountry',
      Countries.find(
        (country) =>
          country.code === testIrecOrg.primaryContactOrganizationCountry
      ).name
    );
    cy.inputHasValue('existingIRECOrg', testIrecOrg.subsidiaries);
    cy.inputHasValue('primaryContactName', testIrecOrg.primaryContactName);
    cy.inputHasValue('primaryContactEmail', testIrecOrg.primaryContactEmail);
    cy.inputHasValue(
      'primaryContactPhoneNumber',
      testIrecOrg.primaryContactPhoneNumber
    );
    cy.inputHasValue('primaryContactFax', testIrecOrg.primaryContactFax);
    cy.inputHasValue('leadUserTitle', testIrecOrg.leadUserTitle);
    cy.inputHasValue('leadUserFirstName', testIrecOrg.leadUserFirstName);
    cy.inputHasValue('leadUserLastName', testIrecOrg.leadUserLastName);
    cy.inputHasValue('leadUserEmail', testIrecOrg.leadUserEmail);
    cy.inputHasValue('leadUserPhoneNumber', testIrecOrg.leadUserPhoneNumber);
    cy.inputHasValue('leadUserFax', testIrecOrg.leadUserFax);
  });
});
