import { Module } from '@nestjs/common';
import { FileController } from './file.controller';

@Module({
    imports: [],
    providers: [],
    controllers: [FileController]
})
export class FileModule {}
