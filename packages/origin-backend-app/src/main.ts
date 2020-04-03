import { AppModule as ExchangeModule } from '@energyweb/exchange';
import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { useContainer } from 'class-validator';

import { OriginAppModule } from './origin-app.module';
import * as PortUtils from './port';

export async function startAPI(logger?: LoggerService) {
    const PORT = PortUtils.getPort();

    console.log(`Backend starting on port: ${PORT}`);

    const app = await NestFactory.create(OriginAppModule.register(null));
    app.useWebSocketAdapter(new WsAdapter(app));
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
