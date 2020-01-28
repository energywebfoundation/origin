import dotenv from 'dotenv';
import path from 'path';
import program from 'commander';
import { OffChainDataSource } from '@energyweb/origin-backend-client';

import { startEventListener } from './index';

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.parse(process.argv);

(async () => {
    dotenv.config({
        path: program.env ? path.resolve(__dirname, program.env) : '../../.env'
    });

    await startEventListener({
        web3Url: process.env.WEB3,
        offChainDataSource: new OffChainDataSource(`${process.env.BACKEND_URL}/api`),
        accountPrivKey: process.env.EVENT_LISTENER_PRIV_KEY,
        scanInterval: 3000,
        notificationInterval: 60000,
        mandrillApiKey: process.env.MANDRILL_API_KEY,
        emailFrom: process.env.EMAIL_FROM
    });
})();
