import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [AdminService],
    controllers: [AdminController],
    exports: [AdminService]
})
export class AdminModule {}
