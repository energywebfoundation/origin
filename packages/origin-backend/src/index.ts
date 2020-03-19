import { NestFactory } from '@nestjs/core';
import { LoggerService } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppModule } from './app.module';
import * as PortUtils from './port';
import { DeviceModule } from './pods/device/device.module';
import { DeviceService } from './pods/device/device.service';

export * from './pods/configuration';

export async function startAPI(logger?: LoggerService) {
    const PORT = PortUtils.getPort();

    console.log(`Backend starting on port: ${PORT}`);

    const app = await NestFactory.create(AppModule.register(null));
    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableCors();
    app.setGlobalPrefix('api');

    if (logger) {
        app.useLogger(logger);
    }

    await app.listen(PORT);

    return app;
}

export { AppModule, PortUtils, DeviceModule, DeviceService };
