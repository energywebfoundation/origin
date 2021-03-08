/// <reference types="cypress" />

type UserRegisterData = {
    email: string;
    password: string;
    title: string;
    firstName: string;
    lastName: string;
    telephone: string;
};

type UserLoginData = {
    email: string;
    password: string;
};

declare namespace Cypress {
    interface Chainable {
        dataCy(value: string): Chainable<Element>;
        clearInput(target: string): Chainable<Element>;
        inputRequired(target: string, neighbor: string): Chainable<Element>;
        filledInputRequired(target: string, neighbor: string): Chainable<Element>;
        fillUserRegister(user: UserRegisterData): Chainable<Element>;
        notification(text: string): Chainable<Element>;
        fillUserLogin(loginData: UserLoginData): Chainable<Element>;
        apiRegisterUser(user: UserRegisterData): Chainable<Element>;
        apiLoginUser(loginData: UserLoginData): Chainable<Element>;
        apiRegisterAndApproveUser(user: UserRegisterData): Chainable<Element>;
    }
}
