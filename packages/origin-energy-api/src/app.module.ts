import { Module } from '@nestjs/common';

import { ReadsModule } from './reads/reads.module';

@Module({
    imports: [ReadsModule]
})
export class AppModule {}
