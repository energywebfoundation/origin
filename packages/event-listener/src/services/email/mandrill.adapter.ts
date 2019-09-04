import { IEmailAdapter } from './IEmailAdapter';
import mandrill from 'mandrill-api/mandrill';

import { IEmail } from '../email.service';

export class MandrillEmailAdapter implements IEmailAdapter {
    private mandrill;

    constructor (apiKey: string) {
        this.mandrill = new mandrill.Mandrill(apiKey);
    }

    async send(
        from: string,
        email: IEmail
    ): Promise<boolean> {
        const { to, subject, html } = email;

        const toFormatted = to.map(toAddress => {
            return {
                email: toAddress,
                name: toAddress,
                type: 'to'
            };
        });

        const message = {
            html,
            subject,
            from_email: from,
            from_name: 'Energy Web Origin',
            to: toFormatted
        };

        const result = await this.mandrill.messages.send({ message, async: true });

        return result === 'sent';
    }
}
