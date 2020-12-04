import { Module } from '@nestjs/common';

import { RegistrationModule } from './registration/registration.module';
import { ConnectionModule } from './connection/connection.module';

@Module({
    imports: [RegistrationModule, ConnectionModule]
})
export class AppModule {}
