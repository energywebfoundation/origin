describe('Devices for not registered user', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('[User - Org - ExchangeAddress -] All Devices should show default devices', () => {
        cy.visit('/devices/production');
    });

    it('Check requirements in My Devices and Register Device', () => {});
});
