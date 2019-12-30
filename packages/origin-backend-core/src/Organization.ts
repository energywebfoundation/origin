export enum OrganizationStatus {
    Submitted,
    Denied,
    Active
}

export interface IOrganization {
    id: number;

    activeCountries: string;

    code: string;

    name: string;

    contact: string;

    telephone: string;

    email: string;

    address: string;

    shareholders: string;

    ceoPassportNumber: string;

    ceoName: string;

    companyNumber: string;

    vatNumber: string;

    postcode: string;

    headquartersCountry: number;

    country: number;

    businessTypeSelect: string;

    businessTypeInput: string;

    yearOfRegistration: number;

    numberOfEmployees: number;

    website: string;

    status: OrganizationStatus;
}

export type OrganizationPostData = Omit<IOrganization, 'id' | 'status'>;
