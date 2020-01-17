import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';

@Module({
    imports: [],
    providers: [],
    controllers: [ImageController]
})
export class ImageModule {}
