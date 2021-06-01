import { AccessTokens, IRECAPIClient } from '@energyweb/issuer-irec-api-wrapper';
import { CreateConnectionDTO } from './dto';

export class IrecService {
    public async login({
        userName,
        password,
        clientId,
        clientSecret
    }: CreateConnectionDTO): Promise<AccessTokens> {
        const client = new IRECAPIClient(process.env.IREC_API_URL);

        return client.login(userName, password, clientId, clientSecret);
    }
}
