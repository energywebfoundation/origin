import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

import { OriginAppModule } from './origin-app.module';
import * as PortUtils from './port';

export async function startAPI(logger?: LoggerService) {
    const PORT = PortUtils.getPort();

    console.log(`Backend starting on port: ${PORT}`);

    const app = await NestFactory.create(OriginAppModule.register(null));
    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableCors();
    app.setGlobalPrefix('api');

    if (logger) {
        app.useLogger(logger);
    }

    await app.listen(PORT);

    return app;
}

startAPI();
