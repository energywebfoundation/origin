import { generateNewOrg, generateNewUser } from '../../utils/generateMockData';

describe('Register device form validation', () => {
    before(() => {
        const testUser = generateNewUser();
        const testOrg = generateNewOrg(testUser);

        cy.apiRegisterAndApproveUser(testUser);
        cy.apiRegisterAndApproveOrg(testUser, testOrg);

        cy.apiLoginUser(testUser);
        cy.visit('/');

        cy.dataCy('settings-menu').click();
        cy.dataCy('user-profile').click();

        cy.dataCy('exchange-address-create-button').click();

        cy.visit('/devices/add');
    });

    const triggerRequiredMsg = (name: string) => {
        const target = cy.dataCy(name);
        target.click();
        target.find('input').blur();
        target.find('.Mui-error.Mui-required').should('exist');
    };

    it('Should require facility name', () => {
        triggerRequiredMsg('facilityName');
    });

    it('Should require capacity', () => {
        triggerRequiredMsg('capacity');
    });

    it('Should require address', () => {
        triggerRequiredMsg('address');
    });

    it('Should require latitude', () => {
        triggerRequiredMsg('latitude');
    });

    it('Should require longitude', () => {
        triggerRequiredMsg('longitude');
    });

    it('User should not be able to choose multiple device types', () => {
        cy.dataCy('device-type').find('input').click().type('Sol');
        cy.contains('Solar').click();

        cy.dataCy('device-type').find('input').click().type('Win');
        cy.contains('Wind').click();

        cy.dataCy('device-type')
            .find('[class*="MuiChip-label"]')
            .should(($chips) => {
                expect($chips).to.length(1);
                expect($chips.eq(0)).to.contain('Solar');
            });
    });

    // it('Device Image upload check (single image, 10, more than 10)', () => {
    //
    // });
    //
});
