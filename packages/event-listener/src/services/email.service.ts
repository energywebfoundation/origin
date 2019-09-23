import { IEmailAdapter } from '../email/IEmailAdapter';

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
    send: (email: IEmail, callback: () => void) => void;
}

export class EmailServiceProvider implements IEmailServiceProvider {
    public sentEmails: IEmail[] = [];

    constructor(public adapter: IEmailAdapter, private fromEmail: string) {}

    public async send(email: IEmail): Promise<void> {
        const response: IEmailResponse = await this.adapter.send(this.fromEmail, email);

        if (!response.success) {
            console.error(`Unable to send email to ${email.to.join(', ')}: ${response.error}`);
            return;
        }

        this.sentEmails.push(email);
    }
}
