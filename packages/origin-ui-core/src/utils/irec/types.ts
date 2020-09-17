export enum IRECAccountType {
    Registrant = 0,
    Participant = 1
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
};

export type RegistrationIRecPostData = Omit<Registration, 'id' | 'owner'>;
