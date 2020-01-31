import * as Winston from 'winston';

export const logger = Winston.createLogger({
    format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
    level: 'verbose',
    transports: [new Winston.transports.Console({ level: 'verbose' })]
});
