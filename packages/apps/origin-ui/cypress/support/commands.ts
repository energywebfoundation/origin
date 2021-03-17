/// <reference types="cypress" />
import 'cypress-file-upload';
import { IUser, KYCStatus, OrganizationStatus, UserStatus } from '@energyweb/origin-backend-core';

Cypress.Commands.add('dataCy', (value: string) => {
    cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('inputRequired', (target: string, neighbor: string) => {
    cy.dataCy(target).then((elem) => {
        const fieldName = elem.text().slice(0, -2);

        cy.dataCy(target).click();
        cy.dataCy(neighbor).click();

        cy.contains(`${fieldName} is a required field`);
    });
});

Cypress.Commands.add('clearInput', (target: string) => {
    cy.dataCy(target).find('input').clear();
});

Cypress.Commands.add('filledInputRequired', (target: string, neighbor: string) => {
    cy.dataCy(target).then((elem) => {
        const fieldName = elem.text().slice(0, -2);

        cy.clearInput(target);
        cy.dataCy(neighbor).click();

        cy.contains(`${fieldName} is a required field`);
    });
});

Cypress.Commands.add('fillUserRegister', (user: UserRegisterData) => {
    cy.dataCy('title-select').click();
    cy.contains('Mr').click();
    cy.dataCy('first-name').type(user.firstName);
    cy.dataCy('last-name').type(user.lastName);
    cy.dataCy('email').type(user.email);
    cy.dataCy('telephone').type(user.telephone);
    cy.dataCy('password').type(user.password);
});

Cypress.Commands.add('notification', (text: string) => {
    cy.get('.toast').contains(text);
});

Cypress.Commands.add('apiRegisterUser', (user: UserRegisterData) => {
    const registerUrl = `${Cypress.env('apiUrl')}/user/register`;
    cy.request({
        url: registerUrl,
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    }).then((response) => {
        const registeredUser = response.body;
        return registeredUser;
    });
});

Cypress.Commands.add('fillUserLogin', (loginData: UserLoginData) => {
    cy.dataCy('email').type(loginData.email);
    cy.dataCy('password').type(loginData.password);
});

Cypress.Commands.add('apiLoginUser', (loginData: UserLoginData) => {
    const { email, password } = loginData;
    const loginUrl = `${Cypress.env('apiUrl')}/auth/login`;
    const reqBody = { username: email, password };
    cy.request({
        url: loginUrl,
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    }).then((res) => {
        localStorage.setItem('AUTHENTICATION_TOKEN', res.body.accessToken);
        return res.body.accessToken;
    });
});

Cypress.Commands.add('apiRegisterAndApproveUser', (userData: UserRegisterData) => {
    const apiUrl = Cypress.env('apiUrl');

    const adminLoginData = Cypress.env('adminUser');

    cy.apiRegisterUser(userData).then((userToApprove) => {
        const approveBody = {
            ...userToApprove,
            status: UserStatus.Active,
            kycStatus: KYCStatus.Passed
        };

        cy.apiLoginUser(adminLoginData).then((token) => {
            cy.request({
                url: `${apiUrl}/admin/users/${userToApprove.id}`,
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
});

Cypress.Commands.add('attachDocument', (uploadDataCy: string) => {
    cy.dataCy(uploadDataCy).find('input').attachFile({
        filePath: 'testDocument.json',
        mimeType: 'image/png',
        encoding: 'binary'
    });
});

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

Cypress.Commands.add('inputHasValue', (inputCy: string, value: string) => {
    cy.dataCy(inputCy).find('input').should('have.value', value);
});
