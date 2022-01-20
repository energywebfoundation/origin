import fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities, IssuerModule } from '@energyweb/issuer-api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Yaml = require('json-to-pretty-yaml');

export const generateSchema = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [
            TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: Number(process.env.DB_PORT) ?? 5432,
                username: process.env.DB_USERNAME ?? 'postgres',
                password: process.env.DB_PASSWORD ?? 'postgres',
                database: process.env.DB_DATABASE ?? 'origin',
                entities,
                logging: ['info']
            }),
            IssuerModule.register({})
        ]
    }).compile();

    const app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    const options = new DocumentBuilder()
        .setTitle('Issuer API')
        .setDescription('Swagger documentation for the Issuer API')
        .setVersion('0.1')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();

    const document = SwaggerModule.createDocument(app, options);

    if (!document.components.schemas) {
        document.components.schemas = {};
    }

    fs.writeFileSync('./src/schema.yaml', Yaml.stringify(document));
};

(async () => {
    await generateSchema();
})();
