import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module';

@Module({
    imports: [forwardRef(() => TypeOrmModule.forFeature([User])), EmailConfirmationModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule {}
