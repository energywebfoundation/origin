import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function extractPort(url: string): number {
    if (url) {
        const backendUrlSplit: string[] = url.split(':');
        const extractedPort: number = parseInt(backendUrlSplit[backendUrlSplit.length - 1], 10);

        return extractedPort;
    }

    return null;
}

export async function startAPI() {
    const PORT: number =
        parseInt(process.env.PORT, 10) || extractPort(process.env.BACKEND_URL) || 3030;

    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    await app.listen(PORT);

    return app;
}
