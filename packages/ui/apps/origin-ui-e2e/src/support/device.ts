/// <reference types="cypress" />
import { DeviceState } from '@energyweb/origin-device-registry-irec-local-api-react-query-client';

Cypress.Commands.add(
  'fillDeviceInfoForm',
  (deviceData: DeviceInfoFormValues) => {
    cy.get('@fuelType').then((body) => {
      //@ts-ignore
      const fuelTypes = body as FuelType[];
      cy.selectValue(
        'fuelType',
        fuelTypes.find((type) => type.code === deviceData.fuelType).name
      );
    });
    cy.dataCy('facilityName').type(deviceData.facilityName);
    cy.get('@deviceType').then((body) => {
      //@ts-ignore
      const deviceTypes = body as DeviceType[];
      cy.selectValue(
        'deviceType',
        deviceTypes.find((type) => type.code === deviceData.deviceType).name
      );
    });
    cy.selectDate(
      'commissioningDate',
      new Date(deviceData.commissioningDate).getDate().toString()
    );
    cy.selectDate(
      'registrationDate',
      new Date(deviceData.registrationDate).getDate().toString()
    );
    cy.selectValue('gridOperator', deviceData.gridOperator);
    cy.dataCy('capacity').type(deviceData.capacity);
    cy.dataCy('smartMeterId').type(deviceData.smartMeterId);
    cy.dataCy('description').type(deviceData.description);
  }
);

Cypress.Commands.add(
  'fillDeviceLocationForm',
  (deviceData: DeviceLocationFormValues) => {
    cy.selectValue('region', deviceData.region);
    cy.selectValue('subregion', deviceData.subregion);
    cy.dataCy('postalCode').type(deviceData.postalCode);
    cy.dataCy('address').type(deviceData.address);
    cy.dataCy('latitude').type(deviceData.latitude);
    cy.dataCy('longitude').type(deviceData.longitude);
  }
);

Cypress.Commands.add('fillDeviceImagesForm', () => {
  cy.attachDocument('deviceImages');
});

Cypress.Commands.add(
  'fillDeviceForm',
  (userData: UserRegisterData, deviceData: DeviceFormPostData) => {
    cy.apiGetFuelType(userData);
    cy.apiGetDeviceType(userData);

    cy.fillDeviceInfoForm(deviceData);
    cy.nextStep();
    cy.fillDeviceLocationForm(deviceData);
    cy.nextStep();
  }
);

Cypress.Commands.add(
  'apiRegisterDevice',
  (userData: UserRegisterData, deviceData: DeviceFormPostData) => {
    const deviceUrl = `${Cypress.env('apiUrl')}/device-registry`;
    const irecDeviceUrl = `${Cypress.env('apiUrl')}/irec/device-registry`;
    const loginData: UserLoginData = {
      email: userData.email,
      password: userData.password,
    };

    const irecDeviceData = {
      ...deviceData,
      name: deviceData.facilityName,
    };

    cy.apiLoginUser(loginData).then((token) => {
      cy.request({
        url: irecDeviceUrl,
        method: 'POST',
        body: JSON.stringify(irecDeviceData),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json;charset=UTF-8',
        },
      }).then((response) => {
        cy.request({
          url: deviceUrl,
          method: 'POST',
          body: JSON.stringify({
            externalRegistryId: response.body.id,
            smartMeterId: deviceData.smartMeterId,
            description: deviceData.description,
          }),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
          },
        }).then(() => {
          return response.body.id;
        });
      });
    });
  }
);

Cypress.Commands.add(
  'apiRegisterAndApproveDevice',
  (userData: UserRegisterData, deviceData: DeviceFormPostData) => {
    const issuerLoginData = Cypress.env('issuerUser');
    const apiUrl = Cypress.env('apiUrl');
    const approveBody = {
      status: DeviceState.Approved,
    };

    cy.apiRegisterDevice(userData, deviceData).then((deviceId) => {
      cy.apiLoginUser(issuerLoginData).then((token) => {
        cy.request({
          url: `${apiUrl}/irec/device-registry/${deviceId}/status`,
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

Cypress.Commands.add('apiGetFuelType', (userData: UserRegisterData) => {
  const apiUrl = Cypress.env('apiUrl');
  const loginData: UserLoginData = {
    email: userData.email,
    password: userData.password,
  };

  cy.apiLoginUser(loginData).then((token) => {
    cy.request({
      url: `${apiUrl}/irec/device-registry/fuel-type`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    })
      .then((response) => response.body)
      .as('fuelType');
  });
});

Cypress.Commands.add('apiGetDeviceType', (userData: UserRegisterData) => {
  const apiUrl = Cypress.env('apiUrl');
  const loginData: UserLoginData = {
    email: userData.email,
    password: userData.password,
  };

  cy.apiLoginUser(loginData).then((token) => {
    cy.request({
      url: `${apiUrl}/irec/device-registry/device-type`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json;charset=UTF-8',
      },
    })
      .then((response) => response.body)
      .as('deviceType');
  });
});
