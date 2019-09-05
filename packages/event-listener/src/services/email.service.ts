import { IEmailAdapter } from './email/IEmailAdapter';

export interface IEmail {
    to: string[];
    subject: string;
    html: string;
}

export interface IEmailResponse {
    success: boolean;
    error: any;
}

export interface IEmailServiceProvider {
    adapter: IEmailAdapter;
    send: (email: IEmail) => Promise<IEmailResponse>;
}

export class EmailServiceProvider implements IEmailServiceProvider {
    public adapter: IEmailAdapter;

    public sentCounter: number = 0;
    private fromEmail: string;

    constructor (adapter: IEmailAdapter, fromEmail: string) {
        this.adapter = adapter;
        this.fromEmail = fromEmail;
    }

    public async send(email: IEmail): Promise<IEmailResponse> {
        const response: IEmailResponse = await this.adapter.send(this.fromEmail, email);

        if (response.success) {
            this.sentCounter += 1;
        }

        return response;
    }
}
