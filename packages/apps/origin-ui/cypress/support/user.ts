/// <reference types="cypress" />
import { KYCStatus, UserStatus } from '@energyweb/origin-backend-core';

Cypress.Commands.add('fillUserRegister', (user: UserRegisterData) => {
    cy.dataCy('title-select').click();
    cy.contains('Mr').click();
    cy.dataCy('first-name').type(user.firstName);
    cy.dataCy('last-name').type(user.lastName);
    cy.dataCy('email').type(user.email);
    cy.dataCy('telephone').type(user.telephone);
    cy.dataCy('password').type(user.password);
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

Cypress.Commands.add('apiLoginUser', (loginData: UserRegisterData) => {
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

Cypress.Commands.add(
    'apiUserProceedInvitation',
    (userData: UserRegisterData, status: OrganizationInvitationStatus) => {
        const invitationUrl = `${Cypress.env('apiUrl')}/invitation`;

        cy.apiLoginUser(userData).then((token) => {
            cy.request({
                url: invitationUrl,
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            })
                .then((response) => {
                    const inviteId = response.body[0].id;
                    return inviteId;
                })
                .then((inviteId) => {
                    cy.request({
                        url: `${invitationUrl}/${inviteId}/${status}`,
                        method: 'PUT',
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
