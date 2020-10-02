import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileController } from './file.controller';
import { File } from './file.entity';
import { FileService } from './file.service';

@Module({
    imports: [TypeOrmModule.forFeature([File])],
    providers: [FileService],
    controllers: [FileController],
    exports: [FileService]
})
export class FileModule {}
