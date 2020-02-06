import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transfer } from './transfer.entity';
import { TransferService } from './transfer.service';

@Module({
    providers: [TransferService],
    imports: [TypeOrmModule.forFeature([Transfer])],
    exports: [TransferService]
})
export class TransferModule {}
