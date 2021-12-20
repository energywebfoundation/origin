/// <reference types="cypress" />
import { OrganizationStatus } from '@energyweb/origin-backend-core';
import { Countries } from '@energyweb/utils-general';

Cypress.Commands.add(
  'fillIRecRegistrationInfo',
  (iRecData: IRecRegistrationInfoForm) => {
    cy.selectValueByIndex('IRECAccountType', iRecData.accountType);
    cy.selectValue(
      'orgHeadquartersCountry',
      Countries.find((country) => country.code === iRecData.headquarterCountry)
        .name
    );
    cy.dataCy('yearOfregisterIRec').type(iRecData.registrationYear);
    cy.selectValue('numberOfEmployees', iRecData.employeesNumber);
    cy.dataCy('shareholderNames').type(iRecData.shareholders);
    cy.dataCy('orgWebsite').type(iRecData.website);
    cy.selectMultiple(
      'activeCountries',
      iRecData.activeCountries.map(
        (activeCountry) =>
          Countries.find((country) => country.code === activeCountry).name
      )
    );
    cy.dataCy('mainBusiness').type(iRecData.mainBusiness);
    cy.dataCy('ceoName').type(iRecData.ceoName);
    cy.dataCy('ceoPassport').type(iRecData.ceoPassportNumber);
    cy.dataCy('balanceSheetTotal').type(iRecData.balanceSheetTotal).blur();
  }
);

Cypress.Commands.add(
  'fillIrecPrimaryContactDetails',
  (iRecData: IrecPrimaryContactDetails) => {
    cy.dataCy('primaryContactOrgName').type(
      iRecData.primaryContactOrganizationName
    );
    cy.dataCy('primaryContactOrgAddress').type(
      iRecData.primaryContactOrganizationAddress
    );
    cy.dataCy('primaryContactOrgPostalCode').type(
      iRecData.primaryContactOrganizationPostalCode
    );
    cy.selectValue(
      'primaryContactOrgCountry',
      Countries.find(
        (country) => country.code === iRecData.primaryContactOrganizationCountry
      ).name
    );
    cy.dataCy('existingIRECOrg').type(iRecData.subsidiaries);
    cy.dataCy('primaryContactName').type(iRecData.primaryContactName);
    cy.dataCy('primaryContactEmail').type(iRecData.primaryContactEmail);
    cy.dataCy('primaryContactPhoneNumber').type(
      iRecData.primaryContactPhoneNumber
    );
    cy.dataCy('primaryContactFax').type(iRecData.primaryContactFax);
  }
);

Cypress.Commands.add(
  'fillIrecLeadUserDetails',
  (iRecData: IrecLeadUserDetails) => {
    cy.selectValue('leadUserTitle', iRecData.leadUserTitle);
    cy.dataCy('leadUserFirstName').type(iRecData.leadUserFirstName);
    cy.dataCy('leadUserLastName').type(iRecData.leadUserLastName);
    cy.dataCy('leadUserEmail').type(iRecData.leadUserEmail);
    cy.dataCy('leadUserPhoneNumber').type(iRecData.leadUserPhoneNumber);
    cy.dataCy('leadUserFax').type(iRecData.leadUserFax);
  }
);

Cypress.Commands.add('fillOrgRegisterForm', (orgData: OrganizationPostData) => {
  cy.dataCy('organization-name').type(orgData.name);
  cy.dataCy('organization-address').type(orgData.address);
  cy.dataCy('organization-zipcode').type(orgData.zipCode);
  cy.dataCy('organization-city').type(orgData.city);
  cy.dataCy('organization-trade-registry').type(
    orgData.tradeRegistryCompanyNumber
  );
  cy.dataCy('organization-vat').type(orgData.vatNumber);
  cy.dataCy('organization-signatory-name').type(orgData.signatoryFullName);
  cy.dataCy('organization-signatory-address').type(orgData.signatoryAddress);
  cy.dataCy('organization-signatory-zipcode').type(orgData.signatoryZipCode);
  cy.dataCy('organization-signatory-city').type(orgData.signatoryCity);
  cy.dataCy('organization-signatory-email').type(orgData.signatoryEmail);
  cy.dataCy('organization-signatory-phone').type(orgData.signatoryPhoneNumber);
});

Cypress.Commands.add(
  'apiRegisterOrg',
  (userData: UserRegisterData, orgData: OrganizationPostData) => {
    const organizationUrl = `${Cypress.env('apiUrl')}/Organization`;
    const loginData: UserLoginData = {
      email: userData.email,
      password: userData.password,
    };

    cy.apiLoginUser(loginData).then((token) => {
      cy.request({
        url: organizationUrl,
        method: 'POST',
        body: JSON.stringify(orgData),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
        },
      }).then((response) => {
        return response.body.id;
      });
    });
  }
);

Cypress.Commands.add(
  'apiRegisterAndApproveOrg',
  (userData: UserRegisterData, orgData: OrganizationPostData) => {
    const adminLoginData = Cypress.env('adminUser');
    const apiUrl = Cypress.env('apiUrl');
    const approveBody = {
      status: OrganizationStatus.Active,
    };

    cy.apiRegisterOrg(userData, orgData).then((orgId) => {
      cy.apiLoginUser(adminLoginData).then((token) => {
        cy.request({
          url: `${apiUrl}/Organization/${orgId}`,
          method: 'PUT',
          body: JSON.stringify(approveBody),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
          },
        });
        cy.clearLocalStorage();
      });
    });
  }
);

Cypress.Commands.add(
  'apiSendInvitation',
  (
    senderData: UserRegisterData,
    receiverEmail: string,
    role: OrganizationRole
  ) => {
    const invitationUrl = `${Cypress.env('apiUrl')}/invitation`;
    const reqBody = { email: receiverEmail, role };
    cy.apiLoginUser(senderData).then((token) => {
      cy.request({
        url: invitationUrl,
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
        },
      });
      cy.clearLocalStorage();
    });
  }
);
