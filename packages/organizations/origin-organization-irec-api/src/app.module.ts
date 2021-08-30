import { Module } from '@nestjs/common';

import { RegistrationModule } from './registration';
import { ConnectionModule } from './connection';
import { BeneficiaryModule } from './beneficiary';
import { ScheduleModule } from '@nestjs/schedule';
import { IrecModule } from './irec';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        BeneficiaryModule,
        ConnectionModule,
        RegistrationModule,
        IrecModule
    ]
})
export class AppModule {}
