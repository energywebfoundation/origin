import { IEmailAdapter } from './IEmailAdapter';
import { IEmail } from '../email.service';
export declare class TestEmailAdapter implements IEmailAdapter {
    send(from: string, email: IEmail): Promise<boolean>;
}
