import dotenv from 'dotenv';
import path from 'path';
import program from 'commander';

import { startAPI } from '.';

program.option('-e, --env <env_file_path>', 'path to the .env file');
program.parse(process.argv);

dotenv.config({
    path: program.env ? path.resolve(__dirname, program.env) : '../../.env'
});

startAPI();
