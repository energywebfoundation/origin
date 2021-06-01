import { Module } from '@nestjs/common';
import { IrecService } from './irec.service';

@Module({
    imports: [],
    providers: [IrecService],
    exports: [IrecService],
    controllers: []
})
export class ConnectionModule {}
