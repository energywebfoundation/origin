import { Module } from '@nestjs/common';

import { RegistrationModule } from './registration';
import { ConnectionModule } from './connection';
import { BeneficiaryModule } from './beneficiary';

@Module({
    imports: [BeneficiaryModule, ConnectionModule, RegistrationModule]
})
export class AppModule {}
