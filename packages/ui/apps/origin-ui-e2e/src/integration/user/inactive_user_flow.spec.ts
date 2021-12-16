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
    cy.visit('/exchange');
    cy.url().should('include', '/view-market');

    cy.dataCy('exchangeMenu');
    cy.dataCy('exchangeViewMarket');
    cy.dataCy('exchangeAllBundles');

    cy.dataCy('exchangeCreateBundle').should('not.exist');
    cy.dataCy('exchangeMyBundles').should('not.exist');
    cy.dataCy('exchangeMyTrades').should('not.exist');
    cy.dataCy('exchangeMyOrders').should('not.exist');
    cy.dataCy('exchangeSupply').should('not.exist');
  });

  it('should display settings menu for inactive user', () => {
    cy.visit('/account');
    cy.url().should('include', '/settings');

    cy.dataCy('settings-menu');
    cy.dataCy('settings');
    cy.dataCy('user-profile');
  });

  // it('should not allow user to change information and email', () => {
  //   cy.visit('/account/user-profile');
  //   cy.dataCy('info-edit-button').click();

  //   cy.dataCy('first-name').find('input').type('-edit').blur();
  //   cy.dataCy('info-save-button').click();
  //   cy.notification('Error to update User profile');
  //   cy.get('.toast').click();
  //   cy.wait(100);

  //   cy.dataCy('last-name').find('input').type('-edit').blur();
  //   cy.dataCy('info-save-button').click();
  //   cy.notification('Error to update User profile');
  //   cy.get('.toast').click();
  //   cy.wait(200);

  //   cy.dataCy('telephone').find('input').type('-edit').blur();
  //   cy.dataCy('info-save-button').click();
  //   cy.notification('Error to update User profile');
  //   cy.get('.toast').click();
  //   cy.wait(300);

  //   cy.dataCy('email-edit-button').click();
  //   cy.dataCy('email').find('input').type('-edit').blur();
  //   cy.dataCy('email-save-button').click();
  //   cy.notification('Error to update User profile');
  // });

  // it('should not allow to change password', () => {
  //   cy.visit('/account/user-profile');
  //   cy.dataCy('password-edit-button').click();

  //   cy.dataCy('current-password').type(testUser.password);
  //   cy.dataCy('password-save-button').should('be.disabled');

  //   const newPassword = testUser.password + '0qwe';
  //   cy.dataCy('new-password').type(newPassword);
  //   cy.dataCy('password-save-button').should('not.be.disabled');

  //   cy.dataCy('confirm-password').type(newPassword);
  //   cy.dataCy('password-save-button').should('not.be.disabled');
  //   cy.dataCy('password-save-button').click();
  //   cy.notification('Error to update User password');
  // });

  // it('should not allow to create exchange deposit address', () => {
  //   cy.visit('/account/user-profile');

  //   cy.dataCy('exchange-address-create-button').click();
  //   cy.notification('Only active users can perform this action');
  // });
});
