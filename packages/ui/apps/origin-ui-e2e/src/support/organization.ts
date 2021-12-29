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

Cypress.Commands.add(
  'fillOrgRegisterInfo',
  (orgData: OrganizationInfoPostData) => {
    cy.dataCy('orgInfoName').type(orgData.name);
    cy.dataCy('orgInfoAddress').type(orgData.address);
    cy.dataCy('orgInfoZipCode').type(orgData.zipCode);
    cy.dataCy('orgInfoCity').type(orgData.city);
    cy.selectValue(
      'orgInfoCountry',
      Countries.find((country) => country.code === orgData.country).name
    );
    cy.selectValueByIndex('orgInfoBusinessType', orgData.businessType);
    cy.dataCy('orgInfoTradeRegistryCompanyNumber').type(
      orgData.tradeRegistryCompanyNumber
    );
    cy.dataCy('orgInfoVatNumber').type(orgData.vatNumber).blur();
  }
);

Cypress.Commands.add(
  'fillOrgRegisterAuthSignInfo',
  (orgData: OrganizationAuthSignInfoPostData) => {
    cy.dataCy('signatoryFullName').type(orgData.signatoryFullName);
    cy.dataCy('signatoryAddress').type(orgData.signatoryAddress);
    cy.dataCy('signatoryZipCode').type(orgData.signatoryZipCode);
    cy.dataCy('signatoryCity').type(orgData.signatoryCity);
    cy.selectValue(
      'signatoryCountry',
      Countries.find((country) => country.code === orgData.signatoryCountry)
        .name
    );
    cy.dataCy('signatoryEmail').type(orgData.signatoryEmail);
    cy.dataCy('signatoryPhoneNumber').type(orgData.signatoryPhoneNumber);
  }
);

Cypress.Commands.add('fillOrgRegisterForm', (orgData: OrganizationPostData) => {
  cy.dataCy('orgInfoName').type(orgData.name);
  cy.dataCy('orgInfoAddress').type(orgData.address);
  cy.dataCy('orgInfoZipCode').type(orgData.zipCode);
  cy.dataCy('orgInfoCity').type(orgData.city);
  cy.selectValue(
    'orgInfoCountry',
    Countries.find((country) => country.code === orgData.country).name
  );
  cy.selectValueByIndex('orgInfoBusinessType', orgData.businessType);
  cy.dataCy('orgInfoTradeRegistryCompanyNumber').type(
    orgData.tradeRegistryCompanyNumber
  );
  cy.dataCy('orgInfoVatNumber').type(orgData.vatNumber).blur();

  cy.nextStep();

  cy.dataCy('signatoryFullName').type(orgData.signatoryFullName);
  cy.dataCy('signatoryAddress').type(orgData.signatoryAddress);
  cy.dataCy('signatoryZipCode').type(orgData.signatoryZipCode);
  cy.dataCy('signatoryCity').type(orgData.signatoryCity);
  cy.selectValue(
    'signatoryCountry',
    Countries.find((country) => country.code === orgData.signatoryCountry).name
  );
  cy.dataCy('signatoryEmail').type(orgData.signatoryEmail);
  cy.dataCy('signatoryPhoneNumber').type(orgData.signatoryPhoneNumber);

  cy.nextStep();

  cy.attachDocument('companyProof');
  cy.attachDocument('signatoryId');
});

Cypress.Commands.add('fillConnectIrecForm', () => {
  cy.dataCy('connectIRecUserName').type('userName');
  cy.dataCy('connectIRecApiKey').type('apiKey');
  cy.dataCy('connectIRecClientId').type('clientId');
  cy.dataCy('connectIRecClientSecret').type('clientSecret');
});

Cypress.Commands.add('apiConnectIrec', (userData: UserRegisterData) => {
  const irecConnectionUrl = `${Cypress.env('apiUrl')}/irec/connection`;
  const loginData: UserLoginData = {
    email: userData.email,
    password: userData.password,
  };

  const body = {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    password: 'apiKey',
    userName: 'userName',
  };

  cy.apiLoginUser(loginData).then((token) => {
    cy.request({
      url: irecConnectionUrl,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });
  });
});

Cypress.Commands.add(
  'apiRegisterIrecOrg',
  (userData: UserRegisterData, irecData: IRecOrganizationPostData) => {
    const organizationUrl = `${Cypress.env('apiUrl')}/irec/registration`;
    const loginData: UserLoginData = {
      email: userData.email,
      password: userData.password,
    };

    const irecBody = {
      ...irecData,
      accountType: parseInt(irecData.accountType),
      registrationYear: parseInt(irecData.registrationYear),
    };

    cy.apiLoginUser(loginData).then((token) => {
      cy.request({
        url: organizationUrl,
        method: 'POST',
        body: JSON.stringify(irecBody),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
        },
      });
    });
  }
);

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
