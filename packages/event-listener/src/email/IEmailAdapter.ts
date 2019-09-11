import { IEmail, IEmailResponse } from '../services/email.service';

export interface IEmailAdapter {
    send(from: string, email: IEmail): Promise<IEmailResponse>;
}
