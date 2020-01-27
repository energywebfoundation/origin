import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppService } from './app.service';
import { EmptyResultInterceptor } from './empty-result.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new EmptyResultInterceptor());

    const appService = app.get(AppService);
    await appService.init();

    await app.listen(3000);
}
bootstrap();
