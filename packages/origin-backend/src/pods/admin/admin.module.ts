import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AdminController } from './admin.controller';

import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), UserModule],
    controllers: [AdminController]
})
export class AdminModule {}
