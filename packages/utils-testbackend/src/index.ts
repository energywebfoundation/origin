import { startAPI } from './api';
import dotenv from 'dotenv';

function extractPort(url: string): number {
    if (url) {
        const backendUrlSplit: string[] = url.split(':');
        const extractedPort: number = parseInt(backendUrlSplit[backendUrlSplit.length - 1], 10);

        return extractedPort;
    }

    return null;
}

(async () => {
    dotenv.config({
        path: '../../.env'
    });

    await startAPI(extractPort(process.env.BACKEND_URL) || null);
})();
