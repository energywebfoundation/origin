import { IRECAPIClient } from '../src/IRECAPIClient';

export type LoginParams = {
    apiUrl: string;
    login: string;
    apiToken: string;
    clientId: string;
    clientSecret: string;
};

export async function getClient({
    apiUrl,
    login,
    apiToken,
    clientId,
    clientSecret
}: LoginParams): Promise<IRECAPIClient> {
    const client = new IRECAPIClient(apiUrl);
    await client.login(login, apiToken, clientId, clientSecret);

    return client;
}

export const credentials: Record<string, LoginParams> = {
    issuer: {
        apiUrl: process.env.IREC_API_URL,
        login: process.env.IREC_API_ISSUER_LOGIN,
        apiToken: process.env.IREC_API_ISSUER_PASSWORD,
        clientId: process.env.IREC_API_ISSUER_CLIENT_ID,
        clientSecret: process.env.IREC_API_ISSUER_CLIENT_SECRET
    },
    registrant: {
        apiUrl: process.env.IREC_API_URL,
        login: process.env.IREC_API_REGISTRANT_LOGIN,
        apiToken: process.env.IREC_API_REGISTRANT_PASSWORD,
        clientId: process.env.IREC_API_REGISTRANT_CLIENT_ID,
        clientSecret: process.env.IREC_API_REGISTRANT_CLIENT_SECRET
    },
    participant: {
        apiUrl: process.env.IREC_API_URL,
        login: process.env.IREC_API_PARTICIPANT_LOGIN,
        apiToken: process.env.IREC_API_PARTICIPANT_PASSWORD,
        clientId: process.env.IREC_API_PARTICIPANT_CLIENT_ID,
        clientSecret: process.env.IREC_API_PARTICIPANT_CLIENT_SECRET
    }
};
