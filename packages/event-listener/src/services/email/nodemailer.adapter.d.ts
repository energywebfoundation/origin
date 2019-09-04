import { IEmail } from '../email.service';
import { IEmailAdapter } from './IEmailAdapter';
export declare class NodemailerAdapter implements IEmailAdapter {
    send(from: string, email: IEmail): Promise<boolean>;
}
