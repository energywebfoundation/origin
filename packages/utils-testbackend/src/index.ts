import { startAPI } from './api';
import dotenv from 'dotenv';

(async () => {
    dotenv.config({
        path: '../../.env'
    });

    const backendUrlSplit: string[] = process.env.BACKEND_URL.split(':');
    const port: number = parseInt(backendUrlSplit[backendUrlSplit.length - 1], 10);

    await startAPI(port || null);
})();
