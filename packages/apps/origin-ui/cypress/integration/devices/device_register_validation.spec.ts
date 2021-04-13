/// <reference types="cypress" />
/// <reference types="../../support" />

import { generateNewOrg, generateNewUser, generateNewDevice } from '../../utils/generateMockData';

describe('Register device form validation', () => {
    const testUser = generateNewUser();
    const testOrg = generateNewOrg(testUser);
    const testDevice = generateNewDevice(testUser);

    before(() => {
        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);
        cy.apiRegisterAndApproveDevice(testUser, testDevice);

        cy.apiLoginUser(testUser);
        cy.visit('/');

        cy.dataCy('settings-menu').click();
        cy.dataCy('user-profile').click();

        cy.dataCy('exchange-address-create-button').click();
    });

    beforeEach(() => {
        cy.apiLoginUser(testUser);
        cy.visit('/devices/add');
    });

    it('should require fields', () => {
        cy.filledInputRequired('facilityName', 'capacity');
        cy.filledInputRequired('capacity', 'address');
        cy.dataCy('latitude').find('input').focus().blur().focus().blur();
        cy.contains('Latitude is a required field');
        cy.dataCy('longitude').find('input').focus().blur().focus().blur();
        cy.contains('Longitude is a required field');
    });

    it('should not be able to choose multiple device types', () => {
        cy.dataCy('device-type').find('input').click().type('Sol');
        cy.contains('Solar').click();

        cy.dataCy('device-type').find('input').eq(0).click();
        cy.contains('Wind').click();

        cy.dataCy('device-type').find('input').eq(1).click();
        cy.contains('Solar - Photovoltaic').click();

        cy.dataCy('device-type').find('input').eq(1).click();
        cy.contains('Solar - Concentration').click();

        cy.dataCy('device-type').find('input').eq(2).click();
        cy.contains('Solar - Photovoltaic - Roof mounted').click();

        cy.dataCy('device-type').find('input').eq(2).click();
        cy.contains('Solar - Photovoltaic - Ground mounted').click();

        cy.dataCy('device-type')
            .find('[class*="MuiChip-label"]')
            .eq(0)
            .should(($chips) => {
                expect($chips).to.length(1);
                expect($chips.eq(0)).to.contain('Solar');
            });

        cy.dataCy('device-type')
            .find('[class*="MuiChip-label"]')
            .eq(1)
            .should(($chips) => {
                expect($chips).to.length(1);
                expect($chips.eq(0)).to.contain('Solar - Photovoltaic');
            });

        cy.dataCy('device-type')
            .find('[class*="MuiChip-label"]')
            .eq(2)
            .should(($chips) => {
                expect($chips).to.length(1);
                expect($chips.eq(0)).to.contain('Solar - Photovoltaic - Roof mounted');
            });
    });

    it('should upload single Device Image', () => {
        cy.attachDocument('device-upload-image');
        cy.contains('Images have been uploaded.');
    });

    it('should upload 10 Device Images', () => {
        cy.attachMultipleDocuments('device-upload-image', 10);
        cy.contains('Images have been uploaded.');
    });

    it('should show error on upload 11 Device Images', () => {
        cy.attachMultipleDocuments('device-upload-image', 11);
        cy.contains("Please select up to 10 images. You've selected 11.");
        cy.get('.toast').click();
    });
});
