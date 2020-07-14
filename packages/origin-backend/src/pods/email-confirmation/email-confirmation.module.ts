import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfirmationService } from './email-confirmation.service';
import { EmailConfirmation } from './email-confirmation.entity';
import { NotificationModule } from '../notification';

@Module({
    imports: [TypeOrmModule.forFeature([EmailConfirmation]), NotificationModule],
    providers: [EmailConfirmationService],
    controllers: [],
    exports: [EmailConfirmationService]
})
export class EmailConfirmationModule {}
