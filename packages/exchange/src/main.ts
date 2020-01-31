import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AppService } from './app.service';
import { EmptyResultInterceptor } from './empty-result.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new EmptyResultInterceptor());

    const appService = app.get(AppService);

    const options = new DocumentBuilder()
        .setTitle('@energyweb/exchange')
        .setDescription('@energyweb/exchange API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await appService.init();

    await app.listen(3000);
}
bootstrap();
