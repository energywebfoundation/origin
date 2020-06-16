import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AdminController } from './admin.controller';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), NotificationModule, UserModule],
    controllers: [AdminController]
})
export class AdminModule {}
