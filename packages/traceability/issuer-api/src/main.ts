import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
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
    process.env.WEB3 = 'http://localhost:8581';
    process.env.DEPLOY_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';

    const app = await NestFactory.create(RootModule);
    await app.listen(3000);
}

bootstrap();
