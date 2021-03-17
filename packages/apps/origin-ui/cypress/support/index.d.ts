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

type OrganizationPostData = {
    name: string;
    address: string;
    zipCode: string;
    city: string;
    country: string;
    businessType: string;
    tradeRegistryCompanyNumber: string;
    vatNumber: string;
    signatoryFullName: string;
    signatoryAddress: string;
    signatoryZipCode: string;
    signatoryCity: string;
    signatoryCountry: string;
    signatoryEmail: string;
    signatoryPhoneNumber: string;
    signatoryDocumentIds?: string[];
    documentIds?: string[];
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
        fillOrgRegisterForm(orgData: OrganizationPostData): Chainable<Element>;
        attachDocument(uploadDataCy: string): Chainable<Element>;
        apiRegisterOrg(
            userData: UserRegisterData,
            orgData: OrganizationPostData
        ): Chainable<Element>;
        apiRegisterAndApproveOrg(
            userData: UserRegisterData,
            orgData: OrganizationPostData
        ): Chainable<Element>;
        inputHasValue(inputCy: string, value: string): Chainable<Element>;
    }
}
