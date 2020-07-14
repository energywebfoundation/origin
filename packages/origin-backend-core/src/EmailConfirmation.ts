export interface IEmailConfirmationToken {
    token: string;
    expiryTimestamp: number;
}

export interface IEmailConfirmation extends IEmailConfirmationToken {
    id: number;
    confirmed: boolean;
}
