/// <reference types="cypress" />
import { DeviceStatus } from '@energyweb/origin-backend-core';

Cypress.Commands.add(
    'apiRegisterDevice',
    (userData: UserRegisterData, deviceData: DevicePostData) => {
        const deviceUrl = `${Cypress.env('apiUrl')}/Device`;
        const loginData: UserLoginData = { email: userData.email, password: userData.password };

        cy.apiLoginUser(loginData).then((token) => {
            cy.request({
                url: deviceUrl,
                method: 'POST',
                body: JSON.stringify(deviceData),
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
    'apiRegisterAndApproveDevice',
    (userData: UserRegisterData, deviceData: DevicePostData) => {
        const issuerLoginData = Cypress.env('issuerUser');
        const apiUrl = Cypress.env('apiUrl');
        const approveBody = {
            status: DeviceStatus.Active
        };

        cy.apiRegisterDevice(userData, deviceData).then((deviceId) => {
            cy.apiLoginUser(issuerLoginData).then((token) => {
                cy.request({
                    url: `${apiUrl}/Device/${deviceId}`,
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
