import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import fs from 'fs';

import { OriginAppModule } from './origin-app.module';
import * as PortUtils from './port';

export async function startAPI(logger?: LoggerService) {
    const PORT = PortUtils.getPort();
    const getVersion = () => {
        let info;
        if (fs.existsSync(`${__dirname}/../../../package.json`)) {
            info = fs.readFileSync(`${__dirname}/../../../package.json`);
        } else {
            return 'unknown';
        }

        const parsed = JSON.parse(info.toString());

        return {
            '@energyweb/origin-backend-irec-app': parsed.version,
            '@energyweb/exchange': parsed.dependencies['@energyweb/exchange'],
            '@energyweb/origin-backend': parsed.dependencies['@energyweb/origin-backend'],
            '@energyweb/issuer-api': parsed.dependencies['@energyweb/issuer-api'],
            '@energyweb/origin-organization-irec-api':
                parsed.dependencies['@energyweb/origin-organization-irec-api']
        };
    };

    console.log(`Backend starting on port: ${PORT}`);
    console.log(`Backend versions: ${JSON.stringify(getVersion())}`);

    const app = await NestFactory.create(OriginAppModule);

    app.enableShutdownHooks();
    app.enableCors();
    app.setGlobalPrefix('api');

    useContainer(app.select(OriginAppModule), { fallbackOnErrors: true });

    if (logger) {
        app.useLogger(logger);
    }

    const options = new DocumentBuilder()
        .setTitle('Origin API')
        .setDescription('Swagger documentation for Origin API')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(PORT);

    return app;
}

startAPI();
