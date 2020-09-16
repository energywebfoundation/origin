export interface IEmailConfirmationToken {
    token: string;
    expiryTimestamp: number;
}

export interface IEmailConfirmation extends IEmailConfirmationToken {
    id: number;
    confirmed: boolean;
}

export enum EmailConfirmationResponse {
    Success = 'Email confirmed successfully',
    AlreadyConfirmed = 'Email already confirmed',
    Expired = 'Email confirmation token expired'
}
