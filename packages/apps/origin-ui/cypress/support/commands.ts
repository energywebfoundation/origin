/// <reference types="cypress" />
import 'cypress-file-upload';
import { IUser, KYCStatus, UserStatus } from '@energyweb/origin-backend-core';

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

Cypress.Commands.add('apiRegisterUser', async (user: UserRegisterData) => {
    const apiUrl = Cypress.env('apiUrl');
    await fetch(`${apiUrl}/user/register`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    });
});

Cypress.Commands.add('fillUserLogin', (loginData: UserLoginData) => {
    cy.dataCy('email').type(loginData.email);
    cy.dataCy('password').type(loginData.password);
});

Cypress.Commands.add('apiLoginUser', async (loginData: UserLoginData) => {
    const { email, password } = loginData;
    const apiUrl = Cypress.env('apiUrl');
    const reqBody = { username: email, password };
    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    });
    response.json().then((res) => {
        localStorage.setItem('AUTHENTICATION_TOKEN', res.accessToken);
    });
});

Cypress.Commands.add('apiRegisterAndApproveUser', async (userData: UserRegisterData) => {
    let userToApprove: IUser;

    const apiUrl = Cypress.env('apiUrl');
    const registerResponse = await fetch(`${apiUrl}/user/register`, {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    });
    registerResponse.json().then((user) => {
        userToApprove = user;
    });

    const { email, password } = Cypress.env('adminUser');
    const loginBody = { username: email, password };
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginBody),
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    });

    loginResponse.json().then((res) => {
        const approveBody = {
            ...userToApprove,
            status: UserStatus.Active,
            kycStatus: KYCStatus.Passed
        };
        fetch(`${apiUrl}/admin/users/${userToApprove.id}`, {
            method: 'PUT',
            body: JSON.stringify(approveBody),
            headers: {
                Authorization: `Bearer ${res.accessToken}`,
                'Content-Type': 'application/json;charset=UTF-8'
            }
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

Cypress.Commands.add('apiRegisterOrg', async (orgData: OrganizationPostData) => {
    const organizationUrl = `${Cypress.env('apiUrl')}/Organization`;
    const token = localStorage.getItem('AUTHENTICATION_TOKEN');

    await fetch(organizationUrl, {
        method: 'POST',
        body: JSON.stringify(orgData),
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8'
        }
    });
});
