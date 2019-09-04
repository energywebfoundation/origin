import { IEmail, IEmailResponse } from '../email.service';

export interface IEmailAdapter {
    send(
        from: string,
        email: IEmail
    ): Promise<IEmailResponse>;
}
