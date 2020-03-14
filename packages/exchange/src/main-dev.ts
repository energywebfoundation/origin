import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { bootstrapTestInstance } from '../test/exchange';

async function bootstrap() {
    const { app } = await bootstrapTestInstance();

    const options = new DocumentBuilder()
        .setTitle('@energyweb/exchange')
        .setDescription('@energyweb/exchange API description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.init();
    await app.listen(3033);
}

bootstrap();
