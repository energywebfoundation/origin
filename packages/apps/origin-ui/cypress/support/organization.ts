/// <reference types="cypress" />
import { OrganizationStatus } from '@energyweb/origin-backend-core';

Cypress.Commands.add('fillOrgRegisterForm', (orgData: OrganizationPostData) => {
    cy.dataCy('organization-name').type(orgData.name);
    cy.dataCy('organization-address').type(orgData.address);
    cy.dataCy('organization-zipcode').type(orgData.zipCode);
    cy.dataCy('organization-city').type(orgData.city);
    cy.dataCy('organization-trade-registry').type(orgData.tradeRegistryCompanyNumber);
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
        const loginData: UserLoginData = { email: userData.email, password: userData.password };

        cy.apiLoginUser(loginData).then((token) => {
            cy.request({
                url: organizationUrl,
                method: 'POST',
                body: JSON.stringify(orgData),
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json;charset=UTF-8'
                }
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
            status: OrganizationStatus.Active
        };

        cy.apiRegisterOrg(userData, orgData).then((orgId) => {
            cy.apiLoginUser(adminLoginData).then((token) => {
                cy.request({
                    url: `${apiUrl}/Organization/${orgId}`,
                    method: 'PUT',
                    body: JSON.stringify(approveBody),
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json;charset=UTF-8'
                    }
                });
                cy.clearLocalStorage();
            });
        });
    }
);

Cypress.Commands.add(
    'apiSendInvitation',
    (senderData: UserRegisterData, receiverEmail: string, role: OrganizationRole) => {
        const invitationUrl = `${Cypress.env('apiUrl')}/invitation`;
        const reqBody = { email: receiverEmail, role };
        cy.apiLoginUser(senderData).then((token) => {
            cy.request({
                url: invitationUrl,
                method: 'POST',
                body: JSON.stringify(reqBody),
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            });
            cy.clearLocalStorage();
        });
    }
);
