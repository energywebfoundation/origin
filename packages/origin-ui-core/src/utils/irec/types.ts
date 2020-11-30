export enum IRECAccountType {
    Registrant = 0,
    Participant = 1,
    Both = 2
}

export type Registration = {
    id: string;
    owner: string;
    accountType: IRECAccountType;
    headquarterCountry: string;
    registrationYear: number;
    employeesNumber: string;
    shareholders: string;
    website: string;
    activeCountries: string[];
    mainBusiness: string;
    ceoName: string;
    ceoPassportNumber: string;
    balanceSheetTotal: string;
    subsidiaries?: string;
    primaryContactOrganizationName: string;
    primaryContactOrganizationAddress: string;
    primaryContactOrganizationPostalCode: string;
    primaryContactOrganizationCountry: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhoneNumber: string;
    primaryContactFax: string;
    leadUserTitle: string;
    leadUserFirstName: string;
    leadUserLastName: string;
    leadUserEmail: string;
    leadUserPhoneNumber: string;
    leadUserFax: string;
};

export type RegistrationIRecPostData = Omit<Registration, 'id' | 'owner'>;
