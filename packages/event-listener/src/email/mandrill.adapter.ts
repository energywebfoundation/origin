import { Mandrill } from 'mandrill-api';

import { IEmailAdapter } from './IEmailAdapter';
import { IEmail, IEmailResponse } from '../services/email.service';

export class MandrillEmailAdapter implements IEmailAdapter {
    private mandrill: Mandrill;

    constructor(private apiKey: string) {
        this.mandrill = new Mandrill(apiKey);
    }

    public async send(from: string, email: IEmail): Promise<IEmailResponse> {
        const { to, subject, html } = email;

        const toFormatted = to.map((toAddress: string) => {
            return {
                email: toAddress,
                name: toAddress,
                type: 'to'
            };
        });

        const message: any = {
            html,
            subject,
            from_email: from,
            from_name: 'Energy Web Origin',
            to: toFormatted,
            headers: {
                'Reply-To': process.env.EMAIL_REPLY_TO
            },
            merge: true,
            tags: ['origin', 'no-reply']
        };

        const result: any = await this.sendMandrill(message);

        if (result === null) {
            return {
                success: true,
                error: null
            };
        }

        return {
            success: result[0].status === 'sent',
            error: result[0].reject_reason ? `Mandrill Error: ${JSON.stringify(result[0])}` : null
        };
    }

    private async sendMandrill(message: any) {
        return this.mandrill.messages.send({
            key: this.apiKey,
            message,
            async: true,
            ip_pool: 'Main Pool'
        });
    }
}
