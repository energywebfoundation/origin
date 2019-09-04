import { IEmailAdapter } from '../../src/services/email/IEmailAdapter';
import { IEmail } from '../../src/services/email.service';

export class TestEmailAdapter implements IEmailAdapter {
    async send(
        from: string,
        email: IEmail
    ): Promise<boolean> {
        console.log(`Sent test email from ${from}`);
        console.log(email);

        return true;
    }
}
