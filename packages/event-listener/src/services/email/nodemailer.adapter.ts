import * as nodemailer from 'nodemailer';

import { IEmail } from '../email.service';
import { IEmailAdapter } from './IEmailAdapter';

export class NodemailerAdapter implements IEmailAdapter {
    async send(
        from: string,
        email: IEmail
    ): Promise<boolean> {
        const { to, subject, html } = email;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const info = await transporter.sendMail({
            from,
            to: to.join(', '),
            subject,
            text: html.replace(/<[^>]*>?/gm, ''),
            html
        });

        console.log(`Message sent: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

        return true;
    }
}
