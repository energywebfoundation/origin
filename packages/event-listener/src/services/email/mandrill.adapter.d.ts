import { IEmailAdapter } from './IEmailAdapter';
import { IEmail } from '../email.service';
export declare class MandrillEmailAdapter implements IEmailAdapter {
    private mandrill;
    constructor(apiKey: string);
    send(from: string, email: IEmail): Promise<boolean>;
}
