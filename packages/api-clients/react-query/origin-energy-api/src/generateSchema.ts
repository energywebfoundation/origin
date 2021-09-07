import fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { AppModule } from '@energyweb/origin-energy-api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Yaml = require('json-to-pretty-yaml');

export const generateSchema = async () => {
    const moduleFixture = await Test.createTestingModule({
        imports: [AppModule]
    }).compile();

    const app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    const options = new DocumentBuilder()
        .setTitle('Origin Energy API')
        .setDescription(
            'Swagger documentation for the Origin Energy API for reading and storing metered data'
        )
        .setVersion('0.1')
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
