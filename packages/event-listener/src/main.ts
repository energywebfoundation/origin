import dotenv from 'dotenv';

import { startEventListener } from './index';

(async () => {
    dotenv.config({
        path: '../../.env'
    });

    await startEventListener();
})();
