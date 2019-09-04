import { IEmailAdapter } from './email/IEmailAdapter';

export interface IEmail {
    to: string[];
    subject: string;
    html: string;
}

export interface IEmailServiceProvider {
    adapter: IEmailAdapter;
    send: (email: IEmail) => Promise<boolean>;
}

export class EmailServiceProvider implements IEmailServiceProvider {
    public adapter: IEmailAdapter;

    public sentCounter: number = 0;
    private fromEmail: string;

    constructor (adapter: IEmailAdapter, fromEmail: string) {
        this.adapter = adapter;
        this.fromEmail = fromEmail;
    }

    public async send(email: IEmail): Promise<boolean> {
        const sent = await this.adapter.send(this.fromEmail, email);
        this.sentCounter += 1;

        return sent;
    }
}
