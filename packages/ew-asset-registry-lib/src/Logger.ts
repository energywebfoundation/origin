import * as Winston from 'winston';

export const logger = Winston.createLogger({
    level: 'debug',
    format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.simple(),
    ),
    transports: [

        new Winston.transports.Console({ level: 'silly' }),
    ],
});