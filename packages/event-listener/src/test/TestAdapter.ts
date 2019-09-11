import { IEmail, IEmailResponse } from '../services/email.service';
import { IEmailAdapter } from '../email/IEmailAdapter';

export class TestEmailAdapter implements IEmailAdapter {
    public async send(from: string, email: IEmail): Promise<IEmailResponse> {
        console.log(`Sent test email from ${from}`);
        console.log(email);

        return {
            success: true,
            error: null
        };
    }
}
