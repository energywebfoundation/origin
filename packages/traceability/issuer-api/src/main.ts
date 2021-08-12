import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './index';

@Module({
    imports: [
        AppModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 5432),
            username: process.env.DB_USERNAME ?? 'postgres',
            password: process.env.DB_PASSWORD ?? 'postgres',
            database: process.env.DB_DATABASE ?? 'origin',
            entities,
            logging: ['info'],
            keepConnectionAlive: true
        })
    ]
})
class RootModule {}

/** Development only */
async function bootstrap() {
    const app = await NestFactory.create(RootModule);

    app.useGlobalPipes(new ValidationPipe());
    await app.listen(3000);
}

bootstrap();
