/// <reference types="cypress" />

import { generateNewUser } from '../../utils/generateMockData';

describe('User with status Pending flow', () => {
  const testUser = generateNewUser();

  before(() => {
    cy.apiRegisterUser(testUser);
  });

  beforeEach(() => {
    const { email, password } = testUser;
    cy.apiLoginUser({ email, password });
  });

  it('should display user name and pending status badge on the Sidebar', () => {
    cy.visit('/');
    cy.contains(`${testUser.firstName} ${testUser.lastName}`);
    cy.dataCy('user-pending-badge')
      .find('span')
      .should('have.css', 'background-color', 'rgb(255, 215, 0)');
    cy.dataCy('user-pending-badge').find('span').last().trigger('mouseover');
    cy.contains('Your user account status is pending');
  });

  it('should display device menu for inactive user', () => {
    cy.visit('/device/all');
    cy.url().should('include', '/all');

    cy.dataCy('deviceMenu');
    cy.dataCy('allDevices');
    cy.dataCy('devicesMap');

    cy.dataCy('myDevices').should('not.exist');
    cy.dataCy('pendingDevices').should('not.exist');
    cy.dataCy('registerDevice').should('not.exist');
    cy.dataCy('importDevice').should('not.exist');
  });

  it('should not display certificates menu', () => {
    cy.dataCy('certificateMenu').should('not.exist');
  });

  it('should display exchange menu for inactive user', () => {
    cy.visit('/exchange/view-market');
    cy.url().should('include', '/exchange/view-market');

    cy.dataCy('exchangeMenu');
    cy.dataCy('exchangeViewMarket');
    cy.dataCy('exchangeAllPackages');

    cy.dataCy('exchangeCreatePackage').should('not.exist');
    cy.dataCy('exchangeMyPackages').should('not.exist');
    cy.dataCy('exchangeMyTrades').should('not.exist');
    cy.dataCy('exchangeMyOrders').should('not.exist');
    cy.dataCy('exchangeSupply').should('not.exist');
  });

  it('should display settings menu for inactive user', () => {
    cy.visit('/account/settings');
    cy.url().should('include', '/account/settings');

    cy.dataCy('settingsMenu');
    cy.dataCy('accountSettings');
    cy.dataCy('accountUserProfile');
  });

  it('should not allow user to change information and email', () => {
    cy.visit('/account/profile');

    cy.dataCy('firstName').type('-edit').blur();
    cy.dataCy('user-data-change-button').click();
    cy.notification(
      'Only active users can perform this action. Your status is Pending'
    );

    cy.dataCy('lastName').type('-edit').blur();
    cy.dataCy('user-data-change-button').click();
    cy.notification(
      'Only active users can perform this action. Your status is Pending'
    );

    cy.dataCy('telephone').type('-edit').blur();
    cy.dataCy('user-data-change-button').click();
    cy.notification(
      'Only active users can perform this action. Your status is Pending'
    );

    cy.dataCy('email').type('-edit').blur();
    cy.dataCy('email-change-button').click();
    cy.notification(
      'Only active users can perform this action. Your status is Pending'
    );
  });

  it('should not allow to change password', () => {
    cy.visit('/account/profile');

    cy.dataCy('oldPassword').type(testUser.password);
    cy.dataCy('password-change-button').should('be.disabled');

    const newPassword = testUser.password + '0qwe';
    cy.dataCy('newPassword').type(newPassword);
    cy.dataCy('newPasswordConfirm').type(newPassword).blur();
    cy.dataCy('password-change-button').should('not.be.disabled');

    cy.dataCy('password-change-button').click();
    cy.notification(
      'Only active users can perform this action. Your status is Pending'
    );
  });
});
