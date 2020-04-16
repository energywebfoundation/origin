import { AppModule as ExchangeModule } from '@energyweb/exchange';
import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import fs from 'fs';

import { OriginAppModule } from './origin-app.module';
import * as PortUtils from './port';

export async function startAPI(logger?: LoggerService) {
    const PORT = PortUtils.getPort();
    const getVersion = () => {
        let info;
        if (fs.existsSync('package.json')) {
            info = fs.readFileSync('package.json');
        } else if (fs.existsSync('../package.json')) {
            info = fs.readFileSync('../package.json');
        } else {
            return 'unknown';
        }

        return JSON.parse(info.toString()).version;
    };

    console.log(`Backend starting on port: ${PORT}`);
    console.log(`Backend version: ${getVersion()}`);

    const app = await NestFactory.create(OriginAppModule.register(null));
    app.enableCors();
    app.setGlobalPrefix('api');

    // TODO: this should be OriginAppModule but for some reason it crashes, probably due to the fact it's dynamic module
    useContainer(app.select(ExchangeModule), { fallbackOnErrors: true });

    if (logger) {
        app.useLogger(logger);
    }

    await app.listen(PORT);

    return app;
}

startAPI();
