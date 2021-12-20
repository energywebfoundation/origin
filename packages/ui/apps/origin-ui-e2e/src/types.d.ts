/// <reference types="cypress" />

type UserRegisterData = {
  email: string;
  password: string;
  title: string;
  firstName: string;
  lastName: string;
  telephone: string;
};
enum OrganizationInvitationStatus {
  Pending = 'Pending',
  Rejected = 'Rejected',
  Accepted = 'Accepted',
  Viewed = 'Viewed',
}

enum Role {
  OrganizationAdmin = 1,
  OrganizationDeviceManager = 2,
  OrganizationUser = 4,
  Issuer = 8,
  Admin = 16,
  SupportAgent = 32,
}
type OrganizationRole =
  | Role.OrganizationUser
  | Role.OrganizationDeviceManager
  | Role.OrganizationAdmin;

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

type IRecRegistrationInfoForm = {
  accountType: string;
  headquarterCountry: string[] | string;
  registrationYear: string;
  employeesNumber: string;
  shareholders: string;
  website: string;
  activeCountries: string[];
  mainBusiness: string;
  ceoName: string;
  ceoPassportNumber: string;
  balanceSheetTotal: string;
};

type IrecPrimaryContactDetails = {
  primaryContactOrganizationName: string;
  primaryContactOrganizationAddress: string;
  primaryContactOrganizationPostalCode: string;
  primaryContactOrganizationCountry: string;
  subsidiaries?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhoneNumber: string;
  primaryContactFax: string;
};

type IrecLeadUserDetails = {
  leadUserTitle: string;
  leadUserTitleInput?: string;
  leadUserFirstName: string;
  leadUserLastName: string;
  leadUserEmail: string;
  leadUserPhoneNumber: string;
  leadUserFax: string;
};

type IRecOrganizationPostData = IRecRegistrationInfoForm &
  IrecPrimaryContactDetails &
  IrecLeadUserDetails;

type DevicePostData = {
  address: string;
  capacityInW: number;
  complianceRegistry: string;
  country: string;
  description: string;
  deviceType: string;
  externalDeviceIds: { type: string }[];
  facilityName: string;
  files: string;
  gpsLatitude: string;
  gpsLongitude: string;
  gridOperator: string;
  images: string;
  operationalSince: number;
  otherGreenAttributes: string;
  province: string;
  region: string;
  status: string;
  timezone: string;
  typeOfPublicSupport: string;
};

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): void;
    dataCy(value: string): Chainable<Element>;
    clearInput(target: string): Chainable<Element>;
    selectValue(target: string, value: string): Chainable<Element>;
    selectValueByIndex(target: string, index: string): Chainable<Element>;
    selectMultiple(target: string, values: string[]): Chainable<Element>;
    inputRequired(target: string, neighbor: string): Chainable<Element>;
    filledInputRequired(target: string, neighbor: string): Chainable<Element>;
    fillUserRegister(user: UserRegisterData): Chainable<Element>;
    notification(text: string): Chainable<Element>;
    nextStep(): void;
    closeAllNotifications(): void;
    fillUserLogin(loginData: UserLoginData): Chainable<Element>;
    apiRegisterUser(user: UserRegisterData): Chainable<Element>;
    apiLoginUser(loginData: UserLoginData): Chainable<Element>;
    apiRegisterAndApproveUser(user: UserRegisterData): Chainable<Element>;
    fillOrgRegisterForm(orgData: OrganizationPostData): Chainable<Element>;
    fillIrecPrimaryContactDetails(
      orgData: IrecPrimaryContactDetails
    ): Chainable<Element>;
    fillIrecLeadUserDetails(orgData: IrecLeadUserDetails): Chainable<Element>;
    fillIRecRegistrationInfo(
      iRecData: IRecRegistrationInfoForm
    ): Chainable<Element>;
    attachDocument(uploadDataCy: string): Chainable<Element>;
    attachMultipleDocuments(
      uploadDataCy: string,
      count: number
    ): Chainable<Element>;
    apiRegisterOrg(
      userData: UserRegisterData,
      orgData: OrganizationPostData
    ): Chainable<Element>;
    apiRegisterAndApproveOrg(
      userData: UserRegisterData,
      orgData: OrganizationPostData
    ): Chainable<Element>;
    inputHasValue(inputCy: string, value: string): Chainable<Element>;
    apiUserProceedInvitation(
      userDate: UserRegisterData,
      status: OrganizationInvitationStatus
    ): Chainable<Element>;
    apiSendInvitation(
      senderData: UserRegisterData,
      receiverEmail: string,
      role: OrganizationRole
    ): Chainable<Element>;
    apiRegisterDevice(
      userData: UserRegisterData,
      testDevice: DevicePostData
    ): Chainable<Element>;
    apiRegisterAndApproveDevice(
      userData: UserRegisterData,
      testDevice: DevicePostData
    ): Chainable<Element>;
  }
}
